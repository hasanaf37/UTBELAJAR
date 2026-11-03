const fs = require('fs');
const questions = JSON.parse(fs.readFileSync('scratch/stsi4207_questions.json', 'utf-8'));

const jsContent = `/* ==============================================================================
   UTBELAJAR - BANK SOAL STSI4207 (SISTEM INFORMASI MANAJEMEN)
   Modul 1 - 8 (Semester 4) - 170 Butir Soal Tes Formatif
   Copyright HasanAF 2026
   ============================================================================== */

window.STSI4207_QUESTIONS = ${JSON.stringify(questions, null, 2)};
`;

fs.writeFileSync('js/stsi4207_questions.js', jsContent, 'utf-8');
console.log('Successfully written js/stsi4207_questions.js, size:', jsContent.length);
