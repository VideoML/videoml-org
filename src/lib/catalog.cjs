const catalog = require('@videoml/stdlib/catalog');
const aliases = {animejs:'animejs',d3:'d3',gsap:'gsap',lottie:'lottie','lottie-web':'lottie',p5:'p5',react:'react',three:'three','three.js':'three','framer-motion':'framer-motion',webgl:'webgl',webgpu:'webgpu'};
const knownFrameworks = [...new Set(Object.values(aliases))].sort();
function frameworksFor(entry) {
 const tokens = [...(entry.tags || []), ...Object.keys(entry.dependencies?.declared || {})].map(x => x.toLowerCase());
 return [...new Set(tokens.map(token => aliases[token]).filter(Boolean))].sort();
}
function filterEntries(entries, {q='', category='', framework=''} = {}) {
 const query=q.trim().toLowerCase();
 return entries.filter(entry => (!category || entry.category===category) && (!framework || (framework==='unspecified' ? frameworksFor(entry).length===0 : frameworksFor(entry).includes(framework))) && (!query || [entry.name,entry.title,entry.description,...entry.tags].some(value => value.toLowerCase().includes(query))));
}
function sortEntries(entries) { const rank={verified:0,implemented:1,planned:2}; return [...entries].sort((a,b)=>(rank[a.status]??3)-(rank[b.status]??3) || a.title.localeCompare(b.title,'en') || a.id.localeCompare(b.id,'en')); }
module.exports={readCatalog:()=>catalog,frameworksFor,filterEntries,knownFrameworks,sortEntries};
