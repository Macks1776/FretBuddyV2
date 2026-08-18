const glyphMap = require("@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json");
const keys = Object.keys(glyphMap);
const earKeys = keys.filter(k => k.includes("ear"));
console.log("MaterialCommunityIcons ear icons:", earKeys);
