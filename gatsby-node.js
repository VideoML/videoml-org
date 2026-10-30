const path = require('path');
const {readCatalog} = require('./src/lib/catalog.cjs');
exports.createPages = async ({actions}) => {
 const entries=readCatalog().entries;
 const ids=new Set();
 for (const entry of entries) {
  if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(entry.id) || ids.has(entry.id)) throw new Error(`Invalid or duplicate catalog ID: ${entry.id}`);
  ids.add(entry.id);
  actions.createPage({path:`/catalog/${entry.id}/`,component:path.resolve('./src/templates/catalog-entry.tsx'),context:{entry}});
 }
};
