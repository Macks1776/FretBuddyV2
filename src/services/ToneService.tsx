import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { useToneStore } from "../store/useToneStore";
import { useSettingsStore } from "../store/useSettingsStore";

export default function ToneService() {
  const webViewRef = useRef<WebView>(null);
  const { lastPlayedNote, playCount } = useToneStore();
  const { instrumentPreference } = useSettingsStore();

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
                  currentInstrument.play(data.note, audioContext.currentTime, { duration: 2.5, gain: 2.0 });
                }
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
    if (webViewRef.current) {
      const msg = JSON.stringify({ type: "LOAD_INSTRUMENT", instrument: instrumentPreference });
      webViewRef.current.injectJavaScript(`handleMessage('${msg}'); true;`);
    }
  }, [instrumentPreference]);

  // Play Note
  useEffect(() => {
    if (webViewRef.current && lastPlayedNote && playCount > 0) {
      const msg = JSON.stringify({ type: "PLAY_NOTE", note: lastPlayedNote });
      webViewRef.current.injectJavaScript(`handleMessage('${msg}'); true;`);
    }
  }, [lastPlayedNote, playCount]);

  return (
    <View style={styles.hiddenContainer}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          console.log("[ToneService]", data);
        }}
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
