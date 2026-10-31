const {test} = require('node:test');
const assert = require('node:assert/strict');
const {previews} = require('../src/lib/preview.cjs');
const {catalogXml} = require('../src/lib/catalog-xml.cjs');

test('each shipped preview produces matching XML and local asset declarations', () => {
  for (const spec of Object.values(previews)) {
    const xml = catalogXml(spec, spec.defaults);
    if (spec.asset === "scene") {
      assert.match(xml, /width="320" height="240" fps="30"/);
      assert.match(xml, /<scene id="source"/);
      assert.match(xml, /sourceFrame&quot;:75/);
      assert.match(xml, /effect-id="videoml\/ascii-render-pass"/);
      continue;
    }
    assert.ok(xml.includes(`width="1280" height="720" fps="30" duration="${(spec.frames ?? 120) / 30}s"`));
    assert.match(xml, /<voiceover seed="0"\/>/);
    if(spec.kind==='shader') {assert.ok(xml.includes(`effect="${spec.id}" start="2s" duration="1s"`));assert.match(xml,/effect-id="videoml\/echo-smear"/);assert.match(xml,/effect-id="videoml\/particle-text-dissolve"/);}
    else {assert.ok(xml.includes(`effect-id="${spec.id}" effect-version="1"`));assert.ok(xml.includes(`start="0s" duration="${(spec.frames ?? 120) / 30}s"`));}
    if (spec.asset === 'font') assert.match(xml, /id="font" src="assets\/Geist-Latin\.woff2" media-type="font\/woff2"/);
    else if (spec.asset === 'image') assert.match(xml, /id="image" src="assets\/neutral-image\.svg" media-type="image\/svg\+xml"/);
    else assert.doesNotMatch(xml, /<assets>/);
  }
});

test('JSON parameters survive XML attribute escaping', () => {
  const spec = previews['component/particle-text-dissolve'];
  const parameters = {...spec.defaults, text: `A&B <C> '" 🌱`};
  const xml = catalogXml(spec, parameters);
  const encoded = xml.match(/props='([^']*)'/)[1];
  const decoded = encoded.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  assert.deepEqual(JSON.parse(decoded), {parameters});
});
