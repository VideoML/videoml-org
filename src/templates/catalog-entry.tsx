import * as React from 'react';
import {Link} from 'gatsby';
import {Layout} from '../components/Layout';
import '../styles/catalog.css';
import {InteractivePreview} from '../components/catalog/InteractivePreview';
const {previews}=require('../lib/preview.cjs');
const posters: Record<string,{file:string}> = require('../../vendor/posters/manifest.json');
export default function CatalogEntry({pageContext}:{pageContext:{entry:any}}) {
 const e=pageContext.entry;
 return <Layout><div className="catalog-shell catalog-detail"><Link className="catalog-back" to="/catalog/">← Back to catalog</Link><p className="catalog-eyebrow">{e.category} / {e.name}</p><h1>{e.title}</h1><p className="catalog-lede">{e.description}</p><div className="detail-layout"><section><>{previews[e.id] ? <InteractivePreview key={e.id} entry={e}/> : <div className="detail-poster">{posters[e.id] ? <img src={posters[e.id].file} alt={`Still frame of ${e.title}`}/> : <><span>{e.kind}</span><strong>{e.title.slice(0,1)}</strong><p>Preview unavailable</p></>}</div>}</><div className="detail-note"><strong>{e.status==='planned'?'Planned · unavailable':`${e.status} · ${previews[e.id] ? 'interactive preview' : 'preview unavailable'}`}</strong><p>{e.status === 'verified' ? 'This entry is verified.' : e.status === 'implemented' ? 'This entry is implemented but not yet verified.' : 'This entry is planned and not yet available.'}</p></div></section><aside className="detail-info"><h2>Entry details</h2><dl><dt>Identifier</dt><dd>{e.id}</dd><dt>Status</dt><dd>{e.status}</dd><dt>License</dt><dd>{e.upstream.license}</dd><dt>Tags</dt><dd>{e.tags.join(', ') || 'None listed'}</dd><dt>Asset rights</dt><dd>{e.upstream.assetRights}</dd></dl><a href={`https://github.com/heygen-com/hyperframes/tree/${e.upstream.commit}/${e.upstream.path}`}>View upstream source ↗</a><br/><a href={`https://github.com/heygen-com/hyperframes/blob/${e.upstream.commit}/LICENSE`}>View license ↗</a></aside></div></div></Layout>;
}
