// Run only after the primary grants the browser/build slot and supplies the frozen consumer.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createRequire} = require('node:module');
const {mkdirSync, writeFileSync, readFileSync} = require('node:fs');
const {join, resolve} = require('node:path');
const {spawnSync} = require('node:child_process');

test('copied XML and downloaded assets render like the live preview', {timeout: 600000}, async () => {
  const consumer = process.env.P12_CONSUMER;
  const output = process.env.P12_OUTPUT;
  if (!consumer || !output) throw Error('P12_CONSUMER and P12_OUTPUT are required');
  const requireConsumer = createRequire(join(resolve(consumer), 'package.json'));
  const {chromium} = requireConsumer('playwright');
  const cli = join(resolve(consumer), 'node_modules/@videoml/cli/src/cli.ts');
  const node = process.execPath;
  const base = process.env.PREVIEW_BASE_URL || 'http://127.0.0.1:4179';
  const root = resolve(output);
  mkdirSync(root, {recursive:true});
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true});
  try {
    const context = await browser.newContext({viewport:{width:1500,height:3000},deviceScaleFactor:1,permissions:['clipboard-read','clipboard-write']});
    const page = await context.newPage();
    for (const name of ['particle-text-dissolve','particle-image-reveal','echo-smear']) {
      await page.goto(`${base}/catalog/component/${name}/`, {waitUntil:'networkidle'});
      await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent === 'Play' && !b.disabled));
      if (name === 'particle-text-dissolve') {
        await page.getByLabel('text', {exact:true}).fill(`A&B <C> '"`);
        await page.getByRole('button',{name:'Apply changes'}).click();
        await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent === 'Play' && !b.disabled));
      }
      await page.getByRole('button',{name:'Copy XML'}).click();
      const xml = await page.evaluate(() => navigator.clipboard.readText());
      assert.match(xml, /<frame-effect/);
      if (name === 'particle-text-dissolve') for (const entity of ['&amp;', '&lt;C&gt;', '&apos;', '&quot;']) assert.ok(xml.includes(entity));
      const project = join(root,name), assets = join(project,'assets');
      mkdirSync(join(project,'.videoml'),{recursive:true}); mkdirSync(assets,{recursive:true});
      writeFileSync(join(project,'.videoml/config.yml'),'tts:\n  default_provider: auritus\n');
      const xmlPath=join(project,'example.videoml.xml');writeFileSync(xmlPath,xml);
      if (name !== 'echo-smear') {
        const assetName=name==='particle-text-dissolve'?'Geist-Latin.woff2':'neutral-image.svg';
        const downloadPromise=page.waitForEvent('download');
        await page.getByRole('link',{name:assetName,exact:true}).click();
        const download=await downloadPromise;await download.saveAs(join(assets,assetName));
      }
      const run = (...args) => {
        const result=spawnSync(node,['--import','tsx',cli,...args],{cwd:consumer,encoding:'utf8',timeout:180000,env:{...process.env,VIDEOML_CHROMIUM_EXECUTABLE_PATH:process.env.CHROMIUM_EXECUTABLE}});
        if(result.status!==0) throw Error(`vml ${args[0]} failed: ${result.stderr || result.error}`);
      };
      run('generate',xmlPath,'--project-dir',project);
      const script=join(project,'src/videos/catalog-example/catalog-example.script.json');
      const timeline=join(project,'src/videos/catalog-example/catalog-example.timeline.json');
      const frozen=join(project,'src/videos/catalog-example/catalog-example.timeline.resolved.json');
      const outDir=join(project,'.videoml/out/catalog-example');
      run('render','--script',script,'--timeline',timeline,'--resolved-timing',frozen,'--resolved-root',outDir,'--frames',join(project,'frames'),'--out',join(project,'frame.mp4'),'--start','60','--end','60','--workers','1');
      const range=page.getByLabel('Frame');await range.fill('60');
      await page.waitForTimeout(500);
      const frame=page.frameLocator('iframe');
      await page.locator('iframe').evaluate(el=>{el.style.width='1280px';el.style.height='720px';el.parentElement.style.overflow='visible';el.scrollIntoView();});
      await frame.locator('body').evaluate(el=>{el.style.background='#fdfdfd';});
      await page.waitForTimeout(100);
      const box=await page.locator('iframe').boundingBox();
      const live=await page.screenshot({clip:{x:box.x,y:box.y,width:1280,height:720}});
      const exported=readFileSync(join(project,'frames/frame-000060.png'));
      const difference=await page.evaluate(async ({a,b})=>{
        const load=async src=>{const image=new Image();image.src=src;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;canvas.getContext('2d').drawImage(image,0,0);return {width:image.width,height:image.height,data:canvas.getContext('2d').getImageData(0,0,image.width,image.height).data};};
        const first=await load(a),second=await load(b);if(first.width!==second.width||first.height!==second.height)return -1;
        let different=0;for(let i=0;i<first.data.length;i+=4)if([0,1,2].some(k=>Math.abs(first.data[i+k]-second.data[i+k])>8))different++;
        return different/(first.width*first.height);
      },{a:`data:image/png;base64,${live.toString('base64')}`,b:`data:image/png;base64,${exported.toString('base64')}`});
      assert.ok(difference>=0 && difference<=0.005,`${name} copied XML differs from live preview: ${difference}`);
      console.log(`${name}: copied XML and downloaded assets match at frame 60; differing pixels ${difference}`);
    }
    await context.close();
  } finally {await browser.close();}
});
