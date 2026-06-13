const fs = require('fs');
const path = require('path');

function validate(file) {
  const html = fs.readFileSync(file, 'utf8');
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let i = 0; let m; let issues = 0;
  console.log('\n=== ' + file + ' ===');
  while ((m = re.exec(html))) {
    i++;
    try {
      const obj = JSON.parse(m[1]);
      const t = Array.isArray(obj) ? `array(${obj.length})` : (obj['@type'] || (obj['@graph'] ? 'graph' : '?'));
      console.log('  ' + i + '. ✓ @type=' + JSON.stringify(t));
    } catch (e) {
      issues++;
      console.log('  ' + i + '. ✗ PARSE ERROR: ' + e.message);
      console.log('     ' + m[1].slice(0, 160));
    }
  }
  console.log('  total: ' + i + ' script(s), ' + issues + ' issue(s)');
  return issues;
}

const targets = [
  'dist/index.html',
  'dist/glossaire.html',
  'dist/cabinet.html',
  'dist/blog/creer-sarl-tanger-2026.html',
  'dist/services/tenue-comptabilite.html',
  'dist/quartiers/marshan.html',
  'dist/zones/tanger-free-zone.html',
];
let total = 0;
for (const t of targets) total += validate(t);
console.log('\n>>> TOTAL ISSUES: ' + total);
process.exit(total > 0 ? 1 : 0);
