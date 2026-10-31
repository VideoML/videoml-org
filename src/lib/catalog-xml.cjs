/** Produce a standalone XML example for one shipped catalog preview. */
function catalogXml(spec, parameters) {
  const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;').replace(/"/g, '&quot;');
  if (spec.kind === 'shader') {
    const {echo,text}=require('./shader-preview.cjs');
    const {ease,backgroundColor,...colors}=parameters;
    const props=escape(JSON.stringify({...colors,...(backgroundColor?{backgroundColor}:{})}));
    const effect=value=>escape(JSON.stringify({parameters:value}));
    return `<vml id="catalog-example" width="1280" height="720" fps="30" duration="4s">\n  <voiceover seed="0"/>\n  <assets><asset id="font" src="assets/Geist-Latin.woff2" media-type="font/woff2"/></assets>\n  <scene id="from" start="0s" duration="3s">\n    <video-background props='{"color":"#224466"}'/>\n    <frame-effect id="echo" effect-id="videoml/echo-smear" effect-version="1" props='${effect(echo)}' start="0s" duration="3s"/>\n  </scene>\n  <transition id="transition" effect="${escape(spec.id)}" start="2s" duration="1s" ease="${escape(ease)}" props='${props}'/>\n  <scene id="to" start="2s" duration="2s">\n    <video-background props='{"color":"#88aa66"}'/>\n    <frame-effect id="particles" effect-id="videoml/particle-text-dissolve" effect-version="1" props='${effect(text)}' start="0s" duration="2s"/>\n  </scene>\n</vml>\n`;
  }
  const asset = spec.asset === 'font'
    ? {id: 'font', file: 'Geist-Latin.woff2', type: 'font/woff2'}
    : spec.asset === 'image'
      ? {id: 'image', file: 'neutral-image.svg', type: 'image/svg+xml'}
      : null;
  const declarations = asset ? `  <assets>\n    <asset id="${asset.id}" src="assets/${asset.file}" media-type="${asset.type}"/>\n  </assets>\n` : '';
  const props = escape(JSON.stringify({parameters}));
  return `<vml id="catalog-example" width="1280" height="720" fps="30" duration="4s">\n  <voiceover seed="0"/>\n${declarations}  <scene id="example" start="0s" duration="4s">\n    <frame-effect id="effect" effect-id="${escape(spec.id)}" effect-version="1" props='${props}' start="0s" duration="4s"/>\n  </scene>\n</vml>\n`;
}
module.exports = {catalogXml};
