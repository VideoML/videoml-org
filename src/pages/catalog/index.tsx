import * as React from 'react';
import {Link} from 'gatsby';
import {Layout} from '../../components/Layout';
import '../../styles/catalog.css';
const {readCatalog,filterEntries,frameworksFor,sortEntries} = require('../../lib/catalog.cjs');
const manifest=readCatalog();
const entries=sortEntries(manifest.entries);
const {previews}=require('../../lib/preview.cjs');
const posters: Record<string,{file:string}> = require('../../../vendor/posters/manifest.json');
const categories=[...new Set(entries.map((entry:any)=>entry.category))].sort() as string[];
const frameworks=[...new Set(entries.flatMap((entry:any)=>frameworksFor(entry)))].sort() as string[];
const values=(search:string)=>{const p=new URLSearchParams(search);return {q:p.get('q') || '',category:p.get('category') || '',framework:p.get('framework') || ''};};
export default function Catalog() {
 const [filters,setFilters]=React.useState({q:'',category:'',framework:''});
 React.useEffect(()=>{const sync=()=>setFilters(values(window.location.search));sync();window.addEventListener('popstate',sync);return ()=>window.removeEventListener('popstate',sync);},[]);
 const update=(key:string,value:string)=>{const p=new URLSearchParams(window.location.search);value?p.set(key,value):p.delete(key);const query=p.toString();window.history[key==='q'?'replaceState':'pushState']({},'',window.location.pathname+(query?'?'+query:''));setFilters(values(window.location.search));};
 const shown=filterEntries(entries,filters);
 return <Layout><div className="catalog-shell"><div className="catalog-hero"><div><p className="catalog-eyebrow">VIDEOML / EFFECTS INDEX</p><h1>Explore the catalog.</h1><p>Discover the building blocks for frame-driven video. Entries show their current implementation status as the catalog grows.</p></div><div className="catalog-counter"><strong>{entries.length}</strong><span>catalog entries</span><small>{manifest.counts.verified} verified releases</small></div></div>
 <div className="catalog-toolbar"><label>Search<input type="search" value={filters.q} onChange={e=>update('q',e.target.value)} placeholder="Name, description or tag" /></label><label>Category<select value={filters.category} onChange={e=>update('category',e.target.value)}><option value="">All categories</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></label><label>Framework<select value={filters.framework} onChange={e=>update('framework',e.target.value)}><option value="">All frameworks</option>{frameworks.map(f=><option key={f} value={f}>{f}</option>)}<option value="unspecified">Not specified</option></select></label></div>
 <div className="catalog-results" aria-live="polite"><span>{shown.length} {shown.length===1?'result':'results'}</span><span>Framework labels reflect declared tags or dependencies.</span></div>
 {shown.length ? <div className="catalog-grid">{shown.map((entry:any)=><Link className="catalog-card" to={`/catalog/${entry.id}/`} key={entry.id}><div className="catalog-poster">{posters[entry.id] ? <img src={posters[entry.id].file} alt="" loading="lazy"/> : <><span>{entry.kind}</span><strong>{entry.title.slice(0,1)}</strong><small>PREVIEW UNAVAILABLE</small></>}</div><div className="catalog-card-body"><div className="catalog-meta"><span>{entry.category}</span><span>{entry.status==='planned'?'Planned · unavailable':entry.status+(previews[entry.id] ? ' · interactive preview' : ' · preview unavailable')}</span></div><h2>{entry.title}</h2><p>{entry.description}</p><div className="catalog-tags">{entry.tags.slice(0,3).map((tag:string)=><span key={tag}>{tag}</span>)}</div></div></Link>)}</div>:<div className="catalog-empty">No entries match these filters. Try another search or category.</div>}</div></Layout>;
}
