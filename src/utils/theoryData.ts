export interface TheoryScale {
  id: string;
  name: string;
  description: string;
  steps: string[]; // W, H, 1.5 (W+H)
  formula: string[]; // 1, 2, b3, etc
}

export interface TheoryChord {
  id: string;
  name: string;
  description: string;
  formula: string[]; // 1, 3, 5, etc
}

export interface TheoryProgression {
  id: string;
  name: string;
  chords: string[]; // e.g. ["I", "V", "vi", "IV"]
  vibe: string;
  description: string;
  examples: string[];
}

export const SCALES: TheoryScale[] = [
  {
    id: "major",
    name: "Major Scale (Ionian)",
    description: "The foundation of Western music theory. Sounds happy and resolved.",
    steps: ["W", "W", "H", "W", "W", "W", "H"],
    formula: ["1", "2", "3", "4", "5", "6", "7"]
  },
  {
    id: "aeolian",
    name: "Natural Minor (Aeolian)",
    description: "The relative minor of the major scale. Sounds sad or serious.",
    steps: ["W", "H", "W", "W", "H", "W", "W"],
    formula: ["1", "2", "b3", "4", "5", "b6", "b7"]
  },
  {
    id: "major_pentatonic",
    name: "Major Pentatonic",
    description: "A 5-note scale heavily used in blues, rock, and country. Removes the 4th and 7th to avoid dissonant half-steps.",
    steps: ["W", "W", "W+H", "W", "W+H"],
    formula: ["1", "2", "3", "5", "6"]
  },
  {
    id: "minor_pentatonic",
    name: "Minor Pentatonic",
    description: "The most common scale in rock and blues solos.",
    steps: ["W+H", "W", "W", "W+H", "W"],
    formula: ["1", "b3", "4", "5", "b7"]
  },
  {
    id: "blues",
    name: "Blues Scale",
    description: "The minor pentatonic scale with an added 'blue note' (flat 5th) for extra tension.",
    steps: ["W+H", "W", "H", "H", "W+H", "W"],
    formula: ["1", "b3", "4", "b5", "5", "b7"]
  },
  {
    id: "harmonic_minor",
    name: "Harmonic Minor",
    description: "Similar to natural minor but with a raised 7th, giving it a classical, neoclassical, or 'Middle Eastern' flavor.",
    steps: ["W", "H", "W", "W", "H", "W+H", "H"],
    formula: ["1", "2", "b3", "4", "5", "b6", "7"]
  },
  {
    id: "dorian",
    name: "Dorian Mode",
    description: "A minor scale with a natural 6th. Popular in jazz, funk, and blues (e.g., Santana).",
    steps: ["W", "H", "W", "W", "W", "H", "W"],
    formula: ["1", "2", "b3", "4", "5", "6", "b7"]
  },
  {
    id: "mixolydian",
    name: "Mixolydian Mode",
    description: "A major scale with a flat 7th. The quintessential sound of blues and classic rock rhythm.",
    steps: ["W", "W", "H", "W", "W", "H", "W"],
    formula: ["1", "2", "3", "4", "5", "6", "b7"]
  }
];

export const CHORDS: TheoryChord[] = [
  {
    id: "major",
    name: "Major Triad",
    description: "A happy, stable sounding 3-note chord.",
    formula: ["1", "3", "5"]
  },
  {
    id: "minor",
    name: "Minor Triad",
    description: "A sad, serious, or moody 3-note chord.",
    formula: ["1", "b3", "5"]
  },
  {
    id: "diminished",
    name: "Diminished Triad",
    description: "A very tense, unstable chord built entirely of minor thirds.",
    formula: ["1", "b3", "b5"]
  },
  {
    id: "augmented",
    name: "Augmented Triad",
    description: "A dreamy or suspended sounding chord built entirely of major thirds.",
    formula: ["1", "3", "#5"]
  },
  {
    id: "major7",
    name: "Major 7th",
    description: "A jazzy, lush, and romantic sounding major chord.",
    formula: ["1", "3", "5", "7"]
  },
  {
    id: "minor7",
    name: "Minor 7th",
    description: "A mellow, soulful extension of the minor triad.",
    formula: ["1", "b3", "5", "b7"]
  },
  {
    id: "dominant7",
    name: "Dominant 7th",
    description: "A major chord with a flat 7th. Highly unstable, driving forward movement. Central to the blues.",
    formula: ["1", "3", "5", "b7"]
  },
  {
    id: "sus2",
    name: "Suspended 2nd (sus2)",
    description: "An open, airy chord that replaces the 3rd with a 2nd.",
    formula: ["1", "2", "5"]
  },
  {
    id: "sus4",
    name: "Suspended 4th (sus4)",
    description: "A chord that demands resolution, replacing the 3rd with a 4th.",
    formula: ["1", "4", "5"]
  }
];

export const PROGRESSIONS: TheoryProgression[] = [
  {
    id: "four-chord",
    name: "The Four-Chord Progression",
    chords: ["I", "V", "vi", "IV"],
    vibe: "Universal, Foundational",
    description: "The most common chord progression in Western popular music. It starts stable, creates tension, moves to a minor emotional chord, and resolves beautifully back home.",
    examples: ["Let It Be (The Beatles, 1970)", "Don't Stop Believin' (Journey, 1981)", "I'm Yours (Jason Mraz, 2008)"]
  },
  {
    id: "50s-doo-wop",
    name: "The 50s Doo-Wop",
    chords: ["I", "vi", "IV", "V"],
    vibe: "Nostalgic, Romantic",
    description: "Extremely popular in the 1950s and 60s. The movement to the minor vi chord creates a romantic, nostalgic feel before climbing back up to the dominant V.",
    examples: ["Earth Angel (Connie Francis, 1959)", "Every Breath You Take (The Police, 1983)", "Perfect (Ed Sheeran, 2017)"]
  },
  {
    id: "blues-12-bar",
    name: "12-Bar Blues",
    chords: ["I", "IV", "V"],
    vibe: "Blues, Rock & Roll, Roots",
    description: "The foundation of blues and early rock. It traditionally uses dominant 7th chords for all three chords, creating constant tension and a driving feel. Structured over 12 bars.",
    examples: ["Johnny B. Goode (Chuck Berry, 1958)", "Pride and Joy (Stevie Ray Vaughan, 1983)", "Give Me One Reason (Tracy Chapman, 1995)"]
  },
  {
    id: "jazz-ii-v-i",
    name: "The Jazz 2-5-1",
    chords: ["ii", "V", "I"],
    vibe: "Jazzy, Sophisticated, Smooth",
    description: "The most important progression in jazz. It provides a strong, smooth resolution to the tonic (I). Usually played with 7th chords (ii7 - V7 - Imaj7).",
    examples: ["Fly Me To The Moon (Frank Sinatra, 1964)", "Just the Way You Are (Billy Joel, 1977)", "Sunday Morning (Maroon 5, 2004)"]
  },
  {
    id: "descending-flamenco",
    name: "Andalusian Cadence",
    chords: ["i", "VII", "VI", "V"],
    vibe: "Flamenco, Dramatic, Exotic",
    description: "A descending progression very common in Flamenco and Spanish music. The final major V chord creates a strong, dramatic tension pulling back to the minor i.",
    examples: ["Hit The Road Jack (Ray Charles, 1961)", "Sultans of Swing (Dire Straits, 1978)", "Smooth (Santana, 1999)"]
  },
  {
    id: "epic-minor",
    name: "The Epic Minor",
    chords: ["i", "VI", "III", "VII"],
    vibe: "Moody, Epic, Modern Pop",
    description: "A very common minor key progression used in modern pop and rock. It sounds moody, driving, and slightly dark.",
    examples: ["The Passenger (Iggy Pop, 1977)", "Africa - Chorus (Toto, 1982)", "Zombie (The Cranberries, 1994)"]
  }
];
