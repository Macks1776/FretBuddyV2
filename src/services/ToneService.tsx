import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, DeviceEventEmitter } from "react-native";
import { WebView } from "react-native-webview";
import { useToneStore } from "../store/useToneStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useMetronomeStore } from "../store/useMetronomeStore";

export default function ToneService() {
  const webViewRef = useRef<WebView>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const { lastPlayedNote, playCount } = useToneStore();
  const { instrumentPreference, noteDurationPreference } = useSettingsStore();
  const { bpm, isPlaying, beatsPerBar, soundType } = useMetronomeStore();
  const lastPlayCountRef = useRef(0);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Load Soundfont Player -->
        <script src="https://cdn.jsdelivr.net/npm/soundfont-player@0.12.0/dist/soundfont-player.min.js"></script>
      </head>
      <body>
        <script>
          let audioContext = null;
          let currentInstrument = null;

          // Metronome variables
          let metronomeIsPlaying = false;
          let current16thNote;
          let lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
          let scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
          let nextNoteTime = 0.0; // when the next note is due
          let metronomeTimerID;
          let metronomeBpm = 120;
          let metronomeBeatsPerBar = 4;
          let metronomeSoundType = 'beep';
          let visualTimers = [];

          function nextNote() {
            const secondsPerBeat = 60.0 / metronomeBpm;
            nextNoteTime += secondsPerBeat;
            current16thNote++;
            if (current16thNote === metronomeBeatsPerBar) {
              current16thNote = 0;
            }
          }

          function scheduleNote(beatNumber, time) {
            const osc = audioContext.createOscillator();
            const envelope = audioContext.createGain();

            osc.connect(envelope);
            envelope.connect(audioContext.destination);

            let clickLength = 0.03;

            if (metronomeSoundType === 'click') {
              osc.type = 'square';
              osc.frequency.value = beatNumber === 0 ? 800.0 : 600.0;
              clickLength = 0.01;
            } else if (metronomeSoundType === 'woodblock') {
              osc.type = 'triangle';
              osc.frequency.value = beatNumber === 0 ? 1200.0 : 900.0;
              clickLength = 0.05;
            } else {
              // Default beep
              osc.type = 'sine';
              osc.frequency.value = beatNumber === 0 ? 1000.0 : 800.0;
              clickLength = 0.03;
            }

            envelope.gain.value = 1;
            envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
            envelope.gain.exponentialRampToValueAtTime(0.001, time + clickLength);

            osc.start(time);
            osc.stop(time + clickLength + 0.01);

            // Schedule the visual trigger
            const timeUntilNote = time - audioContext.currentTime;
            const visualTimerId = setTimeout(() => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'METRONOME_BEAT', beat: beatNumber }));
            }, Math.max(0, timeUntilNote * 1000));
            visualTimers.push(visualTimerId);
          }

          function scheduler() {
            while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
              scheduleNote(current16thNote, nextNoteTime);
              nextNote();
            }
            metronomeTimerID = setTimeout(scheduler, lookahead);
          }

          function startMetronome(bpm, beats, sound) {
            initAudio();
            if (audioContext.state === 'suspended') {
              audioContext.resume();
            }
            metronomeBpm = bpm;
            metronomeBeatsPerBar = beats;
            metronomeSoundType = sound;
            
            if (metronomeIsPlaying) return; // Already playing

            metronomeIsPlaying = true;
            current16thNote = 0;
            nextNoteTime = audioContext.currentTime + 0.05;
            scheduler();
          }

          function stopMetronome() {
            metronomeIsPlaying = false;
            clearTimeout(metronomeTimerID);
            visualTimers.forEach(id => clearTimeout(id));
            visualTimers = [];
          }

          function updateMetronome(bpm, beats, sound) {
            metronomeBpm = bpm;
            metronomeBeatsPerBar = beats;
            metronomeSoundType = sound;
          }

          function initAudio() {
            if (!audioContext) {
              const AudioContext = window.AudioContext || window.webkitAudioContext;
              audioContext = new AudioContext();
            }
          }

          function loadInstrument(instrumentName) {
            initAudio();
            Soundfont.instrument(audioContext, instrumentName, { format: 'mp3', soundfont: 'MusyngKite' }).then(function (inst) {
              currentInstrument = inst;
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'STATUS', status: 'LOADED', instrument: instrumentName }));
            }).catch(function(err) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: err.toString() }));
            });
          }

          document.addEventListener('message', function(event) {
            handleMessage(event.data);
          });
          window.addEventListener('message', function(event) {
            handleMessage(event.data);
          });

          function handleMessage(dataStr) {
            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'LOAD_INSTRUMENT') {
                loadInstrument(data.instrument);
              } else if (data.type === 'PLAY_NOTE') {
                if (currentInstrument && audioContext) {
                  // Resume context in case it was suspended by browser autoplay policies
                  if (audioContext.state === 'suspended') {
                    audioContext.resume();
                  }
                  currentInstrument.play(data.note, audioContext.currentTime, { 
                    duration: data.duration, 
                    gain: 2.0,
                    release: 0.8 // Adds an 800ms fade out instead of a hard cut
                  });
                }
              } else if (data.type === 'METRONOME_START') {
                startMetronome(data.bpm, data.beats, data.sound);
              } else if (data.type === 'METRONOME_STOP') {
                stopMetronome();
              } else if (data.type === 'METRONOME_UPDATE') {
                updateMetronome(data.bpm, data.beats, data.sound);
              }
            } catch (e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: 'Failed to parse: ' + dataStr }));
            }
          }
        </script>
      </body>
    </html>
  `;

  // Change Instrument
  useEffect(() => {
    if (webViewRef.current && isWebViewReady) {
      const msg = JSON.stringify({ type: "LOAD_INSTRUMENT", instrument: instrumentPreference });
      webViewRef.current.injectJavaScript(`handleMessage('${msg}'); true;`);
    }
  }, [instrumentPreference, isWebViewReady]);

  // Play Note
  useEffect(() => {
    if (webViewRef.current && isWebViewReady && lastPlayedNote && playCount > 0 && playCount !== lastPlayCountRef.current) {
      lastPlayCountRef.current = playCount;
      const durationMap: Record<string, number> = {
        "extra_short": 0.5,
        "short": 1.0,
        "normal": 2.0,
        "long": 3.5,
        "extra_long": 5.0
      };
      const duration = durationMap[noteDurationPreference] || 2.0;
      
      const msg = JSON.stringify({ type: "PLAY_NOTE", note: lastPlayedNote, duration });
      webViewRef.current.injectJavaScript(`handleMessage('${msg}'); true;`);
    }
  }, [lastPlayedNote, playCount, noteDurationPreference, isWebViewReady]);

  // Handle Metronome
  useEffect(() => {
    if (webViewRef.current && isWebViewReady) {
      if (isPlaying) {
        const msg = JSON.stringify({ type: "METRONOME_START", bpm, beats: beatsPerBar, sound: soundType });
        webViewRef.current.injectJavaScript(`handleMessage('${msg}'); true;`);
      } else {
        const msg = JSON.stringify({ type: "METRONOME_STOP" });
        webViewRef.current.injectJavaScript(`handleMessage('${msg}'); true;`);
      }
    }
  }, [isPlaying, isWebViewReady]);

  // Update Metronome BPM/Beats/Sound while playing
  useEffect(() => {
    if (webViewRef.current && isWebViewReady && isPlaying) {
      const msg = JSON.stringify({ type: "METRONOME_UPDATE", bpm, beats: beatsPerBar, sound: soundType });
      webViewRef.current.injectJavaScript(`handleMessage('${msg}'); true;`);
    }
  }, [bpm, beatsPerBar, soundType, isWebViewReady]);

  return (
    <View style={styles.hiddenContainer}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'METRONOME_BEAT') {
            DeviceEventEmitter.emit('onMetronomeBeat', data.beat);
          } else {
            console.log("[ToneService]", data);
          }
        }}
        onLoadEnd={() => setIsWebViewReady(true)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenContainer: {
    width: 0,
    height: 0,
    opacity: 0,
    position: "absolute",
    zIndex: -9999,
  },
});
