function shaderTypeScript(spec, applied) {
 return `import { createEffectRegistry, mountEffect } from '@videoml/stdlib/effects';
import { registerEchoSmear } from '@videoml/stdlib/effects/echo-smear';
import { registerParticleEffects } from '@videoml/stdlib/effects/particles';
import { mountSceneCompositor } from '@videoml/stdlib/effects/transitions';
import { gsap } from 'gsap';

const root = document.querySelector<HTMLElement>('#effect-root');
if (!root) throw new Error('Missing #effect-root');
const registry = createEffectRegistry(); registerEchoSmear(registry); registerParticleEffects(registry);
const response = await fetch('./assets/Geist-Latin.woff2');
if (!response.ok) throw new Error('Font unavailable');
const font = URL.createObjectURL(await response.blob());
const context = { width: 1280, height: 720, fps: 30, seed: 0, assets: { font } };
function scene(id: string, parameters: Record<string, unknown>, startFrame: number, endFrame: number, background: string) {
  const layer = document.createElement('div'); Object.assign(layer.style, { position: 'absolute', left: '-10000px', top: '0', width: '1280px', height: '720px' }); document.body.append(layer);
  const effect = mountEffect(layer, registry, { id, version: '1', parameters, startFrame, endFrame }, context);
  const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 720;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas unavailable');
  return { seek: (frame: number) => effect.seek(frame), async capture() { const content = layer.querySelector('canvas'); if (!content) throw new Error('Scene unavailable'); ctx.fillStyle = background; ctx.fillRect(0, 0, 1280, 720); ctx.drawImage(content, 0, 0); return canvas; }, dispose() { effect.dispose(); layer.remove(); } };
}
const from = scene('videoml/echo-smear', ${JSON.stringify(require('./shader-preview.cjs').echo)}, 0, 90, '#224466');
const to = scene('videoml/particle-text-dissolve', ${JSON.stringify(require('./shader-preview.cjs').text)}, 60, 120, '#88aa66');
const easeName = ${JSON.stringify(applied.ease)};
if (!/^[A-Za-z][A-Za-z0-9]*(?:\\.(?:in|out|inOut))?$/.test(easeName)) throw new Error('TRANSITION_INVALID: unknown easing');
const ease = gsap.parseEase(easeName); if (typeof ease !== 'function') throw new Error('TRANSITION_INVALID: unknown easing');
const transition = mountSceneCompositor(root, { from, to, width: 1280, height: 720, startFrame: 60, endFrame: 90, shader: ${JSON.stringify(spec.id)}, parameters: ${JSON.stringify(Object.fromEntries(Object.entries(applied).filter(([key,value])=>key!=='ease' && !(key==='backgroundColor'&&!value))))}, ease });
await transition.seek(75);
// On teardown: transition.dispose(); URL.revokeObjectURL(font);`;
}
module.exports={shaderTypeScript};
