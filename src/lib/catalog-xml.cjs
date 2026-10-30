/** Produce a standalone XML example for one shipped catalog preview. */
function catalogXml(spec, parameters) {
  const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;').replace(/"/g, '&quot;');
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
