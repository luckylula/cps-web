/**
 * Ensambla el jsCode del nodo "Parse CSV Manual" y actualiza Sync_Made_for_Sport_CSV_v3_CON_MARGENES.json
 *
 * Uso: node prisma/scripts/build-made-for-sport-n8n.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const taxonomyPath = path.join(__dirname, 'made-for-sport-taxonomy.n8n.js');
const parsePath = path.join(__dirname, 'made-for-sport-parse-csv.n8n.js');
const insertPath = path.join(__dirname, 'made-for-sport-insert-query.n8n.sql');
const workflowPath = path.join(root, 'files claude', 'Sync_Made_for_Sport_CSV_v3_CON_MARGENES.json');

const taxonomy = fs.readFileSync(taxonomyPath, 'utf8').trim();
const parseCsv = fs.readFileSync(parsePath, 'utf8').trim();
const insertQuery = fs.readFileSync(insertPath, 'utf8').trim();
const fullCode = `${taxonomy}\n\n${parseCsv}`;

if (!fullCode.includes('return products;')) {
  throw new Error('El jsCode ensamblado no contiene return products;');
}
if (!fullCode.includes('classifyMadeForSportProduct')) {
  throw new Error('Falta classifyMadeForSportProduct en el jsCode ensamblado');
}

const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
const parseNode = workflow.nodes.find((n) => n.name === 'Parse CSV Manual');
const insertNode = workflow.nodes.find((n) => n.name === 'Insert to Neon');
if (!parseNode || !insertNode) {
  throw new Error('Nodos Parse CSV Manual o Insert to Neon no encontrados');
}

parseNode.parameters.jsCode = fullCode;
parseNode.notes =
  'v5: taxonomía web CPS (classifyMadeForSportProduct). Regenerar con build-made-for-sport-n8n.cjs';
insertNode.parameters.query = insertQuery;

workflow.name = 'Sync Made for Sport CSV v5 - CON MARGENES SQL';
workflow.versionId = 'v5-taxonomia-web-cps';

fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2));
console.log('OK:', workflowPath);
console.log('jsCode length:', fullCode.length);
