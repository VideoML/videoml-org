const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readCatalog,filterEntries,frameworksFor}=require('../src/lib/catalog.cjs');
test('manifest routes are unique and filters match text, category and framework',()=>{
 const catalog=readCatalog(); assert.equal(catalog.entries.length,469);assert.equal(new Set(catalog.entries.map(e=>e.id)).size,469);
 const example={title:'Motion',description:'Blue waves',name:'motion',category:'component',tags:['gsap','water'],dependencies:{declared:{}}};
 assert.deepEqual(frameworksFor(example),['gsap']);assert.equal(filterEntries([example],{q:'blue',category:'component',framework:'gsap'}).length,1);assert.equal(filterEntries([example],{q:'water',framework:'react'}).length,0);
});
test('available entries sort before planned; aliases reflect declared names',()=>{
 const {sortEntries}=require('../src/lib/catalog.cjs');
 assert.deepEqual(sortEntries([{id:'p',title:'A',status:'planned'},{id:'i',title:'B',status:'implemented'},{id:'v',title:'C',status:'verified'}]).map(e=>e.id),['v','i','p']);
 assert.deepEqual(frameworksFor({tags:[],dependencies:{declared:{'lottie-web':'*','three.js':'*','framer-motion':'*','reactive':'*'}}}),['framer-motion','lottie','three']);
});
test('Gatsby creates one stable detail route with matching context for every catalog entry',async()=>{
 const pages=[];await require('../gatsby-node.js').createPages({actions:{createPage:page=>pages.push(page)}});
 const entries=readCatalog().entries;assert.equal(pages.length,entries.length);
 for(const entry of entries){const matches=pages.filter(p=>p.path===`/catalog/${entry.id}/`);assert.equal(matches.length,1);assert.equal(matches[0].context.entry.id,entry.id);assert.match(matches[0].component,/catalog-entry\.tsx$/);}
});
