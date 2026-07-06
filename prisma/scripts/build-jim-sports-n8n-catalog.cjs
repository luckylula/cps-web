/**
 * Ensambla el jsCode del nodo "Parse CSV + Fix Encoding" y actualiza Jim_Sports_v5_CATALOG.json
 *
 * Uso: node prisma/scripts/build-jim-sports-n8n-catalog.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const taxonomyPath = path.join(__dirname, 'jim-sports-taxonomy.n8n.js');
const parsePath = path.join(__dirname, 'jim-sports-parse-csv.n8n.js');
const catalogPath = path.join(root, 'files claude', 'Jim_Sports_v5_CATALOG.json');

const taxonomy = fs.readFileSync(taxonomyPath, 'utf8').trim();
const parseCsv = fs.readFileSync(parsePath, 'utf8').trim();
const fullCode = `${taxonomy}\n\n${parseCsv}`;

if (!fullCode.includes('return out;')) {
  throw new Error('El jsCode ensamblado no contiene return out;');
}
if (!fullCode.includes('resolveJimSportsTaxonomy')) {
  throw new Error('Falta resolveJimSportsTaxonomy en el jsCode ensamblado');
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const parseNode = catalog.nodes.find((n) => n.name === 'Parse CSV + Fix Encoding');
if (!parseNode) {
  throw new Error('Nodo "Parse CSV + Fix Encoding" no encontrado en el workflow');
}

parseNode.parameters.jsCode = fullCode;
parseNode.notes =
  'v5.2: catálogo + taxonomía web (resolveJimSportsTaxonomy). Regenerar con build-jim-sports-n8n-catalog.cjs';

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log('OK:', catalogPath);
console.log('jsCode length:', fullCode.length);
