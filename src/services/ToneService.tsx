import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, DeviceEventEmitter } from "react-native";
import { WebView } from "react-native-webview";
import { useToneStore } from "../store/useToneStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useMetronomeStore } from "../store/useMetronomeStore";
import { BUILT_IN_SOUNDS } from "../store/useDrumMachineStore";

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

          function initAudio() {
            if (!audioContext) {
              const AudioContext = window.AudioContext || window.webkitAudioContext;
              audioContext = new AudioContext();
            }
          }

          // === Metronome ===
          let metronomeIsPlaying = false;
          let current16thNote = 0;
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
              osc.type = 'sine';
              osc.frequency.value = beatNumber === 0 ? 1000.0 : 800.0;
              clickLength = 0.03;
            }

            envelope.gain.value = 1;
            envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
            envelope.gain.exponentialRampToValueAtTime(0.001, time + clickLength);
            osc.start(time);
            osc.stop(time + clickLength + 0.01);

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
            if (audioContext.state === 'suspended') audioContext.resume();
            metronomeBpm = bpm;
            metronomeBeatsPerBar = beats;
            metronomeSoundType = sound;
            if (metronomeIsPlaying) return;
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

          // === Drum Machine Engine ===
          function createNoiseBuffer(duration) {
            if (!audioContext) return null;
            const bufferSize = audioContext.sampleRate * duration;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              data[i] = Math.random() * 2 - 1;
            }
            return buffer;
          }

          function playDrumSound(params, time, velocity) {
            if (!audioContext) return;
            const vol = velocity || 1.0;
            const p = params || {};
            
            if (!window._noiseBuffer) window._noiseBuffer = createNoiseBuffer(2.0);

            // Ensure time is slightly in the future to prevent exponentialRamp failures
            const safeTime = Math.max(audioContext.currentTime + 0.005, time);

            const masterGain = audioContext.createGain();
            masterGain.connect(audioContext.destination);
            
            const mDecay = p.masterDecay || 0.4;
            masterGain.gain.setValueAtTime(vol, safeTime);
            masterGain.gain.exponentialRampToValueAtTime(0.001, safeTime + mDecay);

            if (p.toneVolume > 0) {
              const osc = audioContext.createOscillator();
              osc.type = p.oscWaveform || 'sine';
              
              const oscGain = audioContext.createGain();
              osc.connect(oscGain);
              oscGain.connect(masterGain);
              
              const pStart = p.pitchStart || 150;
              const pEnd = p.pitchEnd || 40;
              const pDecay = p.pitchDecay || 0.2;
              
              osc.frequency.setValueAtTime(pStart, safeTime);
              osc.frequency.exponentialRampToValueAtTime(pEnd, safeTime + pDecay);
              
              oscGain.gain.setValueAtTime(p.toneVolume, safeTime);
              
              osc.start(safeTime);
              osc.stop(safeTime + mDecay);
            }

            if (p.noiseVolume > 0) {
              const noiseSource = audioContext.createBufferSource();
              noiseSource.buffer = window._noiseBuffer;
              noiseSource.loop = true;

              const noiseFilter = audioContext.createBiquadFilter();
              noiseFilter.type = p.noiseFilterType || 'lowpass';
              noiseFilter.frequency.value = p.noiseFilterFreq || 1000;

              const noiseGain = audioContext.createGain();
              noiseSource.connect(noiseFilter);
              noiseFilter.connect(noiseGain);
              noiseGain.connect(masterGain);

              const nDecay = p.noiseDecay || 0.1;
              noiseGain.gain.setValueAtTime(p.noiseVolume, safeTime);
              noiseGain.gain.exponentialRampToValueAtTime(0.001, safeTime + nDecay);

              noiseSource.start(safeTime);
              noiseSource.stop(safeTime + mDecay);
            }
          }

          // === Drum Sequencer State ===
          let drumIsPlaying = false;
          let drumTimerID;
          let drumBpm = 120;
          let drumCurrentStep = 0; // 0 to drumStepsPerPart - 1
          let drumSeqIndex = 0; // which part in the sequence
          let drumNextNoteTime = 0.0;
          let drumParts = {}; // mapping partId -> { grid: [][] }
          let drumSequence = []; // array of partIds
          let drumSounds = []; // [trackIndex] = soundId (e.g. 'kick' or custom sound name)
          let drumCustomSounds = {}; // { 'custom1': { base: 'kick', pitch: 100... } }
          let drumVisualTimers = [];

          function drumNextStep() {
            const currentPartId = drumSequence[drumSeqIndex];
            const currentPart = (currentPartId && drumParts[currentPartId]) ? drumParts[currentPartId] : null;
            const currentPartSteps = currentPart ? (currentPart.steps || 16) : 16;
            const currentPartRes = currentPart ? (currentPart.resolution || 16) : 16;

            // Calculate step duration based on resolution
            // resolution 16 -> 4 steps per beat. stepDuration = 0.25 beats.
            const secondsPerBeat = 60.0 / drumBpm;
            const stepDuration = secondsPerBeat * (4 / currentPartRes);
            drumNextNoteTime += stepDuration; 
            
            drumCurrentStep++;
            if (drumCurrentStep >= currentPartSteps) {
              drumCurrentStep = 0;
              drumSeqIndex++;
              if (drumSeqIndex >= drumSequence.length) {
                drumSeqIndex = 0;
              }
            }
          }

          function scheduleDrumStep(stepNumber, seqIndex, time) {
            const partId = drumSequence[seqIndex];
            if (!partId || !drumParts[partId]) return;
            
            const currentPart = drumParts[partId];
            const grid = currentPart.grid;
            
            // Swing calculation
            const swing = currentPart.swing || 0;
            let timeToPlay = time;
            
            // Apply swing delay to odd steps (1, 3, 5...)
            if (stepNumber % 2 !== 0 && swing > 0) {
              const secondsPerBeat = 60.0 / drumBpm;
              const stepDuration = secondsPerBeat * (4 / (currentPart.resolution || 16));
              const swingDelay = (swing / 100) * (stepDuration * 0.5);
              timeToPlay += swingDelay;
            }

            // Play active tracks for this step
            for (let trackIdx = 0; trackIdx < grid.length; trackIdx++) {
              const velocity = grid[trackIdx][stepNumber];
              if (velocity > 0) {
                let soundId = drumSounds[trackIdx];
                let params = drumCustomSounds[soundId] || drumCustomSounds['kick'];
                playDrumSound(params, timeToPlay, velocity);
              }
            }

            // Visual trigger
            const timeUntilNote = timeToPlay - audioContext.currentTime;
            const timerId = setTimeout(() => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DRUM_BEAT', step: stepNumber, seqIndex: seqIndex }));
            }, Math.max(0, timeUntilNote * 1000));
            drumVisualTimers.push(timerId);
          }

          function drumScheduler() {
            while (drumNextNoteTime < audioContext.currentTime + scheduleAheadTime) {
              scheduleDrumStep(drumCurrentStep, drumSeqIndex, drumNextNoteTime);
              drumNextStep();
            }
            drumTimerID = setTimeout(drumScheduler, lookahead);
          }

          function startDrumMachine(bpm, parts, sequence, sounds, customSounds) {
            initAudio();
            if (audioContext.state === 'suspended') audioContext.resume();
            drumBpm = bpm;
            
            drumParts = {};
            parts.forEach(p => drumParts[p.id] = p);
            drumSequence = sequence;
            
            drumSounds = sounds;
            drumCustomSounds = customSounds;

            if (drumIsPlaying) return;
            drumIsPlaying = true;
            drumCurrentStep = 0;
            drumSeqIndex = 0;
            drumNextNoteTime = audioContext.currentTime + 0.05;
            drumScheduler();
          }

          function stopDrumMachine() {
            drumIsPlaying = false;
            clearTimeout(drumTimerID);
            drumVisualTimers.forEach(id => clearTimeout(id));
            drumVisualTimers = [];
          }

          function updateDrumMachine(bpm, parts, sequence, sounds, customSounds) {
            drumBpm = bpm;
            drumParts = {};
            parts.forEach(p => drumParts[p.id] = p);
            drumSequence = sequence;
            drumSounds = sounds;
            drumCustomSounds = customSounds;
            
            // Ensure indices are within bounds
            if (drumSequence.length > 0 && drumSeqIndex >= drumSequence.length) {
              drumSeqIndex = 0;
            }
            
            // Ensure step is within bounds if part was truncated
            const currentPartId = drumSequence[drumSeqIndex];
            const currentPart = currentPartId && drumParts[currentPartId];
            if (currentPart && drumCurrentStep >= (currentPart.steps || 16)) {
              drumCurrentStep = 0;
            }
          }

          // === Soundfont Instrument ===
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
                  if (audioContext.state === 'suspended') audioContext.resume();
                  currentInstrument.play(data.note, audioContext.currentTime, { 
                    duration: data.duration, 
                    gain: 2.0,
                    release: 0.8
                  });
                }
              } else if (data.type === 'METRONOME_START') {
                startMetronome(data.bpm, data.beats, data.sound);
              } else if (data.type === 'METRONOME_STOP') {
                stopMetronome();
              } else if (data.type === 'METRONOME_UPDATE') {
                updateMetronome(data.bpm, data.beats, data.sound);
              } else if (data.type === 'DRUM_HIT') {
                initAudio();
                if (audioContext.state === 'suspended') audioContext.resume();
                let params = data.customSounds[data.soundId] || data.customSounds['kick'];
                playDrumSound(params, audioContext.currentTime, data.velocity);
              } else if (data.type === 'DRUM_SEQ_START') {
                startDrumMachine(data.bpm, data.parts, data.sequence, data.sounds, data.customSounds);
              } else if (data.type === 'DRUM_SEQ_STOP') {
                stopDrumMachine();
              } else if (data.type === 'DRUM_SEQ_UPDATE') {
                updateDrumMachine(data.bpm, data.parts, data.sequence, data.sounds, data.customSounds);
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

  // Handle Drum Machine Events via Event Emitter
  useEffect(() => {
    if (!isWebViewReady || !webViewRef.current) return;
    
    const hitSub = DeviceEventEmitter.addListener('playDrumHit', (data: { soundId: string, velocity: number, customSounds: any }) => {
      const mergedSounds = { ...BUILT_IN_SOUNDS, ...data.customSounds };
      const msg = JSON.stringify({ type: 'DRUM_HIT', soundId: data.soundId, velocity: data.velocity, customSounds: mergedSounds });
      webViewRef.current?.injectJavaScript(`handleMessage('${msg}'); true;`);
    });

    const seqStartSub = DeviceEventEmitter.addListener('playDrumSeqStart', (data: any) => {
      const mergedSounds = { ...BUILT_IN_SOUNDS, ...data.customSounds };
      const msg = JSON.stringify({ type: 'DRUM_SEQ_START', ...data, customSounds: mergedSounds });
      webViewRef.current?.injectJavaScript(`handleMessage('${msg}'); true;`);
    });

    const seqStopSub = DeviceEventEmitter.addListener('playDrumSeqStop', () => {
      const msg = JSON.stringify({ type: 'DRUM_SEQ_STOP' });
      webViewRef.current?.injectJavaScript(`handleMessage('${msg}'); true;`);
    });

    const seqUpdateSub = DeviceEventEmitter.addListener('playDrumSeqUpdate', (data: any) => {
      const mergedSounds = { ...BUILT_IN_SOUNDS, ...data.customSounds };
      const msg = JSON.stringify({ type: 'DRUM_SEQ_UPDATE', ...data, customSounds: mergedSounds });
      webViewRef.current?.injectJavaScript(`handleMessage('${msg}'); true;`);
    });

    return () => {
      hitSub.remove();
      seqStartSub.remove();
      seqStopSub.remove();
      seqUpdateSub.remove();
    };
  }, [isWebViewReady]);

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
          } else if (data.type === 'DRUM_BEAT') {
            DeviceEventEmitter.emit('onDrumBeat', data);
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
