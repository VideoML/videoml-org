import {createEffectRegistry,mountEffect,type EffectController} from '@videoml/stdlib/effects';
import {registerParticleEffects} from '@videoml/stdlib/effects/particles';
import {registerCatalogC001} from '@videoml/stdlib/effects/catalog-c001';
import {registerEchoSmear} from '@videoml/stdlib/effects/echo-smear';
import {mountSceneCompositor,validateTransitionOptions,type SceneFrameSource,type SceneTransition} from '@videoml/stdlib/effects/transitions';
import gsapModule from 'gsap';
const {previews}=require('./lib/preview.cjs');
const shaderConfig=require('./lib/shader-preview.cjs');
const host=document.getElementById('root')!;Object.assign(host.style,{width:'1280px',height:'720px',overflow:'hidden',transformOrigin:'top left'});
let controller:{seek(frame:number):Promise<void>;dispose():void}|undefined;let seq=0;const urls:string[]=[];
let previewWidth=1280,previewHeight=720;const resize=()=>{host.style.transform=`scale(${Math.min(window.innerWidth/previewWidth,window.innerHeight/previewHeight)})`;};resize();window.addEventListener('resize',resize);
function mountShader(name:string,raw:any,assets:Record<string,string>) {
 const {ease: easeName,backgroundColor,...colors}=raw;const parameters=validateTransitionOptions({...colors,...(backgroundColor?{backgroundColor}:{})});
 if(typeof easeName!=='string'||!/^[A-Za-z][A-Za-z0-9]*(?:\.(?:in|out|inOut))?$/.test(easeName))throw Error('TRANSITION_INVALID: unknown easing');
 const gsap=(gsapModule as any).gsap ?? gsapModule;const ease=gsap.parseEase(easeName);if(typeof ease!=='function')throw Error(`TRANSITION_INVALID: unknown easing ${easeName}`);
 const registry=createEffectRegistry();registerParticleEffects(registry);registerEchoSmear(registry);
 const context={width:1280,height:720,fps:30,seed:0,assets};const sources:SceneFrameSource[]=[];
 const scene=(id:string,startFrame:number,endFrame:number,background:string,params:Record<string,unknown>)=>{
  const root=document.createElement('div');Object.assign(root.style,{position:'absolute',left:'-10000px',top:'0',width:'1280px',height:'720px'});document.body.append(root);
  let effect:EffectController;try{effect=mountEffect(root,registry,{id,version:'1',parameters:params,startFrame,endFrame},context);}catch(error){root.remove();throw error;}
  const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const ctx=canvas.getContext('2d');if(!ctx){effect.dispose();root.remove();throw Error('SCENE_CAPTURE_UNAVAILABLE: Canvas 2D unavailable');}
  const source:SceneFrameSource={async seek(frame){await effect.seek(frame);},async capture(){const content=root.querySelector('canvas');if(!content)throw Error('SCENE_CAPTURE_UNAVAILABLE: effect canvas missing');ctx.fillStyle=background;ctx.fillRect(0,0,1280,720);ctx.drawImage(content,0,0);return canvas;},dispose(){effect.dispose();root.remove();}};sources.push(source);return source;
 };
 let transition:SceneTransition & {canvas:HTMLCanvasElement}|undefined;
 try {const from=scene('videoml/echo-smear',0,90,'#224466',shaderConfig.echo),to=scene('videoml/particle-text-dissolve',60,120,'#88aa66',shaderConfig.text);transition=mountSceneCompositor(host,{from,to,startFrame:60,endFrame:90,width:1280,height:720,shader:name as any,parameters,ease});}
 catch(error){for(const source of sources)try{source.dispose();}catch{}throw error;}
 const visible=document.createElement('canvas');visible.width=1280;visible.height=720;host.append(visible);const ctx=visible.getContext('2d');if(!ctx){transition.dispose();throw Error('SCENE_CAPTURE_UNAVAILABLE: Canvas 2D unavailable');}
 return {async seek(frame:number){if(!Number.isSafeInteger(frame)||frame<0||frame>=120)throw Error('Invalid frame');if(frame>=60&&frame<=90){visible.style.display='none';transition!.canvas.style.display='block';await transition!.seek(frame);}else{transition!.canvas.style.display='none';visible.style.display='block';const source=sources[frame<60?0:1];const abort=new AbortController();await source.seek(frame,abort.signal);ctx.clearRect(0,0,1280,720);ctx.drawImage(await source.capture(abort.signal),0,0);}},dispose(){transition!.dispose();visible.remove();}};
}
window.addEventListener('message',async(event:MessageEvent)=>{
 if(event.source!==window.parent || event.origin!==window.location.origin || !event.data || event.data.channel!=='videoml-preview')return;
 const request=event.data;if(request.type==='hello'){window.parent.postMessage({channel:'videoml-preview',type:'boot'},window.location.origin);return;}let current=seq;try {
  if(request.type==='mount') {
   const selected=previews[request.entry];if(!selected)throw Error('Preview is unavailable');
   current=++seq;controller?.dispose();controller=undefined;while(urls.length)URL.revokeObjectURL(urls.pop()!);
   const assets:Record<string,string>={};let snapshotBlob:Blob|undefined;if(selected.asset){if(!(request.asset instanceof ArrayBuffer))throw Error('Preview asset is unavailable');const blob=new Blob([request.asset],{type:selected.asset==='font'?'font/woff2':selected.asset==='scene'?'image/png':'image/svg+xml'});if(selected.asset==='scene')snapshotBlob=blob;else {const url=URL.createObjectURL(blob);urls.push(url);assets[selected.asset]=url;}}
   if(current!==seq)return;
   previewWidth=selected.width??1280;previewHeight=selected.height??720;Object.assign(host.style,{width:`${previewWidth}px`,height:`${previewHeight}px`});resize();
   if(selected.kind==='shader')controller=mountShader(selected.id,request.parameters,assets);
   else {const registry=createEffectRegistry();registerParticleEffects(registry);registerEchoSmear(registry);registerCatalogC001(registry);const sceneSnapshots=snapshotBlob?{async capture(input:{sceneId:string;frame:number;signal:AbortSignal}){if(input.sceneId!=='source'||input.frame!==75||input.signal.aborted)throw Error('SCENE_CAPTURE_UNAVAILABLE');const bitmap=await createImageBitmap(snapshotBlob!);if(input.signal.aborted){bitmap.close();throw Error('SCENE_CAPTURE_CANCELLED');}if(bitmap.width!==previewWidth||bitmap.height!==previewHeight){bitmap.close();throw Error('SCENE_CAPTURE_INVALID: bitmap dimensions');}return {bitmap,close(){bitmap.close();}};}}:undefined;controller=mountEffect(host,registry,{id:selected.id,version:'1',parameters:request.parameters,startFrame:0,endFrame:selected.frames??120},{width:previewWidth,height:previewHeight,fps:30,seed:0,assets,sceneSnapshots});}
   await controller.seek(request.frame);
  } else if(request.type==='seek') {if(!controller)throw Error('Preview is not ready');await controller.seek(request.frame);}else return;
  if(current!==seq)return;
  window.parent.postMessage({channel:'videoml-preview',type:'ready',id:request.id},window.location.origin);
 }catch(error){if(current!==seq)return;window.parent.postMessage({channel:'videoml-preview',type:'error',id:request.id,message:error instanceof Error?error.message:String(error)},window.location.origin);}
});
window.addEventListener('pagehide',()=>{seq++;controller?.dispose();urls.forEach(url=>URL.revokeObjectURL(url));});
window.parent.postMessage({channel:'videoml-preview',type:'boot'},window.location.origin);
