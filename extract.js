const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');

// Find QURAN_DATA
const quranDataMatch = content.match(/var\s+QURAN_DATA\s*=\s*(\[[\s\S]*?\]);/);
if (!quranDataMatch) {
    console.error("Could not find QURAN_DATA");
    process.exit(1);
}

// Find QURAN_VERSES
const quranVersesMatch = content.match(/var\s+QURAN_VERSES\s*=\s*(\{[\s\S]*?\n\s*\});/);
if (!quranVersesMatch) {
    console.error("Could not find QURAN_VERSES");
    // We might need a better regex for QURAN_VERSES since it's huge.
}

// Since regex on 7000 lines might be slow or fail, let's use string manipulation
const dataStart = content.indexOf('var QURAN_DATA = [');
const dataEnd = content.indexOf('];', dataStart) + 1;

const versesStart = content.indexOf('var QURAN_VERSES = {');
const versesEnd = content.indexOf('};', versesStart) + 1; // Actually there's a comment // END OF QURAN_VERSES or similar?

console.log("Data start:", dataStart, "end:", dataEnd);
console.log("Verses start:", versesStart);

// Let's output to a file and evaluate using a safer method
