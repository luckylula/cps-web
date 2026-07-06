/**
 * Regenera todos los workflows n8n importables desde los scripts fuente.
 *
 * Uso: node prisma/scripts/build-all-n8n-workflows.cjs
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..', '..');
process.chdir(root);

execSync('node prisma/scripts/build-jim-sports-n8n-catalog.cjs', { stdio: 'inherit' });
execSync('node prisma/scripts/build-made-for-sport-n8n.cjs', { stdio: 'inherit' });

console.log('\nWorkflows listos para importar en n8n:');
console.log('  - files claude/Jim_Sports_v5_CATALOG.json');
console.log('  - files claude/Jim_Sports_v5_PRICES.json (precios, sin cambios de taxonomía)');
console.log('  - files claude/Sync_Made_for_Sport_CSV_v3_CON_MARGENES.json');
