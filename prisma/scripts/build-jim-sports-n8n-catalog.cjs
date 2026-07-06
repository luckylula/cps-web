/**
 * Ensambla el jsCode del nodo "Parse CSV + Fix Encoding" y actualiza Jim_Sports_v5_CATALOG.json
 *
 * Uso: node prisma/scripts/build-jim-sports-n8n-catalog.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const taxonomyPath = path.join(__dirname, 'jim-sports-taxonomy.n8n.js');
const textilPath = path.join(__dirname, 'textil-taxonomy.n8n.js');
const parsePath = path.join(__dirname, 'jim-sports-parse-csv.n8n.js');
const catalogPath = path.join(root, 'files claude', 'Jim_Sports_v5_CATALOG.json');

const textil = fs.readFileSync(textilPath, 'utf8').trim();
const taxonomy = fs.readFileSync(taxonomyPath, 'utf8').trim();
const parseCsv = fs.readFileSync(parsePath, 'utf8').trim();
const fullCode = `${textil}\n\n${taxonomy}\n\n${parseCsv}`;

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
  'v5.3: catálogo + taxonomía web (resolveJimSportsTaxonomy, tenis de mesa/canastas). Regenerar con build-jim-sports-n8n-catalog.cjs';

const catalogName = catalog.name || '';
if (catalogName.includes('v5')) {
  catalog.name = 'Jim Sports v5.4 - CATALOG (CSV + taxonomía web)';
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log('OK:', catalogPath);
console.log('jsCode length:', fullCode.length);
