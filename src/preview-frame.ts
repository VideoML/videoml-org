import {createEffectRegistry,mountEffect} from '@videoml/stdlib/effects';
import {registerParticleEffects} from '@videoml/stdlib/effects/particles';
import {registerEchoSmear} from '@videoml/stdlib/effects/echo-smear';
const {previews}=require('./lib/preview.cjs');
const host=document.getElementById('root')!;Object.assign(host.style,{width:'1280px',height:'720px',overflow:'hidden',transformOrigin:'top left'});
let controller:ReturnType<typeof mountEffect>|undefined;let seq=0;const urls:string[]=[];
const resize=()=>{host.style.transform=`scale(${Math.min(window.innerWidth/1280,window.innerHeight/720)})`;};resize();window.addEventListener('resize',resize);
window.addEventListener('message',async(event:MessageEvent)=>{
 if(event.source!==window.parent || event.origin!==window.location.origin || !event.data || event.data.channel!=='videoml-preview')return;
 const request=event.data;if(request.type==='hello'){window.parent.postMessage({channel:'videoml-preview',type:'boot'},window.location.origin);return;}let current=seq;try {
  if(request.type==='mount') {
   const selected=previews[request.entry];if(!selected)throw Error('Preview is unavailable');
   current=++seq;controller?.dispose();controller=undefined;while(urls.length)URL.revokeObjectURL(urls.pop()!);
   const registry=createEffectRegistry();registerParticleEffects(registry);registerEchoSmear(registry);
   const assets:Record<string,string>={};if(selected.asset){if(!(request.asset instanceof ArrayBuffer))throw Error('Preview asset is unavailable');const blob=new Blob([request.asset],{type:selected.asset==='font'?'font/woff2':'image/svg+xml'});const url=URL.createObjectURL(blob);urls.push(url);assets[selected.asset]=url;}
   if(current!==seq)return;
   controller=mountEffect(host,registry,{id:selected.id,version:'1',parameters:request.parameters,startFrame:0,endFrame:120},{width:1280,height:720,fps:30,seed:0,assets});await controller.seek(request.frame);
  } else if(request.type==='seek') {if(!controller)throw Error('Preview is not ready');await controller.seek(request.frame);}else return;
  if(current!==seq)return;
  window.parent.postMessage({channel:'videoml-preview',type:'ready',id:request.id},window.location.origin);
 }catch(error){if(current!==seq)return;window.parent.postMessage({channel:'videoml-preview',type:'error',id:request.id,message:error instanceof Error?error.message:String(error)},window.location.origin);}
});
window.addEventListener('pagehide',()=>{seq++;controller?.dispose();urls.forEach(url=>URL.revokeObjectURL(url));});
window.parent.postMessage({channel:'videoml-preview',type:'boot'},window.location.origin);
