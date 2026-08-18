const { Chord } = require("@tonaljs/tonal");

// Let's detect some chords
console.log("C E G:", Chord.detect(["C", "E", "G"]));
console.log("C Eb G:", Chord.detect(["C", "Eb", "G"]));
console.log("C E G B:", Chord.detect(["C", "E", "G", "B"]));
console.log("C Eb G Bb:", Chord.detect(["C", "Eb", "G", "Bb"]));
console.log("C E G D:", Chord.detect(["C", "E", "G", "D"]));
console.log("C Eb G D:", Chord.detect(["C", "Eb", "G", "D"]));
console.log("C E G Bb D:", Chord.detect(["C", "E", "G", "Bb", "D"]));
