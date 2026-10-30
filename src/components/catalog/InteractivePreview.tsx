import * as React from 'react';
const {previews}=require('../../lib/preview.cjs');
const {createSeekPump}=require('../../lib/seek-pump.cjs');
const {createPreviewLifecycle}=require('../../lib/preview-lifecycle.cjs');
type Props={entry:any};
export function InteractivePreview({entry}:Props) {
 const spec=previews[entry.id];
 const iframe=React.useRef<HTMLIFrameElement>(null), counter=React.useRef(0), mountId=React.useRef(0), generation=React.useRef(0), abort=React.useRef<AbortController|null>(null), pump=React.useRef<any>(null), mountTimer=React.useRef<number>(), lifecycle=React.useRef(createPreviewLifecycle()), nextParameters=React.useRef<Record<string,any>>({...spec.defaults});
 const [draft,setDraft]=React.useState<Record<string,any>>({...spec.defaults}), [applied,setApplied]=React.useState<Record<string,any>>({...spec.defaults});
 const [frameMounted,setFrameMounted]=React.useState(true);
 const [frame,setFrame]=React.useState(0), [playing,setPlaying]=React.useState(false), [ready,setReady]=React.useState(false), [error,setError]=React.useState('');
 const send=React.useCallback((type:string,extra:Record<string,unknown>)=>{const id=++counter.current;iframe.current?.contentWindow?.postMessage({channel:'videoml-preview',type,id,...extra},'*');return id;},[]);
 const fail=React.useCallback((message:string)=>{lifecycle.current.fail();generation.current++;mountId.current=0;abort.current?.abort();window.clearTimeout(mountTimer.current);pump.current?.dispose();pump.current=null;setFrameMounted(false);setError(message);setPlaying(false);setReady(false);},[]);
 const mount=React.useCallback(async(parameters:Record<string,any>)=>{
  const token=++generation.current;lifecycle.current.begin();abort.current?.abort();const ac=new AbortController();abort.current=ac;pump.current?.dispose();pump.current=null;window.clearTimeout(mountTimer.current);setReady(false);setError('');setPlaying(false);setFrame(0);
  try {let asset:ArrayBuffer|null=null;if(spec.asset){const response=await fetch(spec.asset==='font'?'/catalog-assets/Geist-Latin.woff2':'/catalog-assets/neutral-image.svg',{signal:ac.signal});if(!response.ok)throw Error('Preview asset is unavailable');asset=await response.arrayBuffer();}if(ac.signal.aborted||token!==generation.current)return;
   mountId.current=send('mount',{entry:entry.id,parameters,frame:0,asset});mountTimer.current=window.setTimeout(()=>{if(token===generation.current)fail('Preview mount timed out');},15000);
  }catch(e){if(!ac.signal.aborted && token===generation.current)fail(e instanceof Error?e.message:String(e));}
 },[entry.id,spec,send,fail]);
 React.useEffect(()=>{
  const receive=(event:MessageEvent)=>{if(!lifecycle.current.isActive() || event.source!==iframe.current?.contentWindow || event.origin!=='null' || event.data?.channel!=='videoml-preview')return;const message=event.data;
   if(message.type==='boot'){void mount({...nextParameters.current});return;}
   if(message.type==='error' && (message.id===mountId.current || pump.current?.ack(message.id))){window.clearTimeout(mountTimer.current);fail(message.message);return;}
   if(message.type==='ready' && message.id===mountId.current){window.clearTimeout(mountTimer.current);mountId.current=0;pump.current=createSeekPump((value:number)=>send('seek',{frame:value}),(e:Error)=>fail(e.message));setReady(true);return;}
   if(message.type==='ready')pump.current?.ack(message.id);
  };
  window.addEventListener('message',receive);send('hello',{});
  return()=>{generation.current++;abort.current?.abort();pump.current?.dispose();window.clearTimeout(mountTimer.current);window.removeEventListener('message',receive);};
 },[mount,send,fail,spec]);
 React.useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>setFrame(previous=>(previous+1)%120),1000/30);return()=>window.clearInterval(timer);},[playing]);
 React.useEffect(()=>{if(ready)pump.current?.seek(frame);},[frame,ready]);
 const schema=entry.parameterSchema.properties;
 const source=`import { createEffectRegistry, mountEffect } from '@videoml/stdlib/effects';\nimport { ${entry.name==='echo-smear'?'registerEchoSmear':'registerParticleEffects'} } from '@videoml/stdlib/effects/${entry.name==='echo-smear'?'echo-smear':'particles'}';\n\nconst root = document.querySelector<HTMLElement>('#effect-root');\nif (!root) throw new Error('Missing #effect-root');\nconst assets: Record<string, string> = {};\n${spec.asset ? `const assetResponse = await fetch('/catalog-assets/${spec.asset === 'font' ? 'Geist-Latin.woff2' : 'neutral-image.svg'}');\nif (!assetResponse.ok) throw new Error('Asset unavailable');\nassets.${spec.asset} = URL.createObjectURL(await assetResponse.blob());\n` : ''}const registry = createEffectRegistry();\n${entry.name==='echo-smear'?'registerEchoSmear':'registerParticleEffects'}(registry);\nconst effect = mountEffect(root, registry, ${JSON.stringify({id:spec.id,version:'1',parameters:applied,startFrame:0,endFrame:120},null,2)}, { width: 1280, height: 720, fps: 30, seed: 0, assets });\nawait effect.seek(0);`;
 return <section className="interactive-preview" aria-label="Interactive preview"><div className="preview-viewport">{frameMounted && <iframe ref={iframe} title={`${entry.title} preview`} src="/catalog-preview/" sandbox="allow-scripts" onLoad={()=>send('hello',{})} />}</div><div className="preview-controls"><button type="button" disabled={!ready} onClick={()=>setPlaying(!playing)}>{playing?'Pause':'Play'}</button><label>Frame <input type="range" min="0" max="119" step="1" value={frame} disabled={!ready} onChange={e=>{setPlaying(false);setFrame(Number(e.target.value));}} /></label><output>{frame} / 119</output><button type="button" disabled={!ready} onClick={()=>{setPlaying(false);setFrame(0);}}>Reset</button></div>{error&&<p role="alert">Preview error: {error}</p>}
 <form className="preview-parameters" onSubmit={event=>{event.preventDefault();const next={...draft};setApplied(next);nextParameters.current=next;if(!lifecycle.current.isActive()){lifecycle.current.begin();setError('');setFrameMounted(true);}else void mount(next);}}><h2>Parameters</h2>{spec.controls.map((key:string)=>{const property=schema[key];return <label key={key}>{key}{property.enum?<select value={draft[key]} onChange={e=>setDraft({...draft,[key]:e.target.value})}>{property.enum.map((value:string)=><option key={value} value={value}>{value}</option>)}</select>:<input type={property.type==='number'?'number':key==='color'?'color':'text'} min={property.minimum} max={property.maximum} step={property.type==='number'?'any':undefined} value={draft[key]} onChange={e=>setDraft({...draft,[key]:property.type==='number'?Number(e.target.value):e.target.value})}/>}</label>})}<button type="submit">Apply changes</button></form>
 <section className="preview-source"><h2>Use this effect</h2><p>Requires the frozen stdlib package, a page element with <code>id="effect-root"</code>, and the referenced local assets. Revoke any generated object URLs when the host disposes the effect. XML effect mounting is not yet available.</p><pre><code>{source}</code></pre><button type="button" onClick={()=>navigator.clipboard.writeText(source).catch(()=>setError('Clipboard unavailable'))}>Copy TypeScript</button><p><a href="/catalog-assets/Apache-2.0.txt">Upstream Apache-2.0 license</a>{spec.asset==='font' && <> · <a href="/catalog-assets/Geist-OFL.txt">Geist font license</a></>}</p></section></section>;
}
