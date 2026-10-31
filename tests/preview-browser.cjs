const {test}=require('node:test');const assert=require('node:assert/strict');const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.PREVIEW_BASE_URL||'http://127.0.0.1:4179';
const screenshotDir=process.env.PREVIEW_SCREENSHOT_DIR||'/tmp';
test('three shipped previews honor controls, isolation, navigation and failure handling',async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true});
 try{const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});const outside=[];page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(base))outside.push(r.url())});
 for(const name of ['particle-text-dissolve','particle-image-reveal','echo-smear']){
  await page.goto(`${base}/catalog/component/${name}/`,{waitUntil:'networkidle'});const play=page.getByRole('button',{name:'Play',exact:true});await play.waitFor();await page.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.textContent==='Play'&&!b.disabled),{timeout:15000});
  assert.equal(await page.locator('output').innerText(),'0 / 119');await page.waitForTimeout(200);assert.equal(await page.locator('output').innerText(),'0 / 119');
  const range=page.getByLabel('Frame');await range.fill('60');await page.waitForTimeout(300);assert.equal(await page.locator('output').innerText(),'60 / 119');const canvas=page.frameLocator('iframe').locator('canvas').first();
  const pixels=await canvas.evaluate(node=>{const canvas=node;const context=canvas.getContext('2d');const data=context.getImageData(0,0,canvas.width,canvas.height).data;let visible=0;for(let i=3;i<data.length;i+=4)if(data[i])visible++;return visible;});assert.ok(pixels>0,`${name} produced no visible pixels at frame 60`);
  await page.screenshot({path:`${screenshotDir}/videoml-p12-final-${name}.png`});
  if(name==='echo-smear'){for(const frame of [0,15,30,45,60]){await range.fill(String(frame));await page.waitForTimeout(300);const count=await canvas.evaluate(node=>{const ctx=node.getContext('2d'),data=ctx.getImageData(0,0,node.width,node.height).data;let visible=0;for(let i=3;i<data.length;i+=4)if(data[i])visible++;return visible;});assert.ok(count>0,`echo frame ${frame} is empty`);console.log(`echo frame ${frame}: ${count} visible pixels`);await page.screenshot({path:`${screenshotDir}/videoml-p12-echo-${frame}.png`});}}
  await play.click();await page.waitForTimeout(180);await page.getByRole('button',{name:'Pause',exact:true}).click();const paused=await page.locator('output').innerText();await page.waitForTimeout(150);assert.equal(await page.locator('output').innerText(),paused);
  await page.getByRole('button',{name:'Reset',exact:true}).click();assert.equal(await page.locator('output').innerText(),'0 / 119');
  await page.evaluate(()=>window.postMessage({channel:'videoml-preview',type:'error',id:1,message:'spoof'},'*'));await page.waitForTimeout(50);assert.equal(await page.locator('[role=alert]').count(),0);
  const controls=page.locator('.preview-parameters select');if(await controls.count()){const select=controls.first();const options=await select.locator('option').all();await select.selectOption(await options[options.length-1].getAttribute('value'));await page.getByRole('button',{name:'Apply changes'}).click();await page.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.textContent==='Play'&&!b.disabled),{timeout:15000});}
 }
 const oldFrame=page.locator('iframe');await page.getByRole('link',{name:'← Back to catalog'}).click();await page.waitForURL('**/catalog/');assert.equal(await oldFrame.count(),0);await page.getByRole('link',{name:/Particle Image Reveal/}).first().click();await page.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.textContent==='Play'&&!b.disabled),{timeout:15000});assert.match(page.url(),/particle-image-reveal/);
 await page.goto(`${base}/catalog/component/particle-text-dissolve/`,{waitUntil:'networkidle'});await page.route('**/catalog-assets/Geist-Latin.woff2',r=>r.abort());await page.reload();await page.locator('[role=alert]').waitFor();assert.match(await page.locator('[role=alert]').innerText(),/asset|fetch/i);assert.deepEqual(outside,[]);await page.close();
 }finally{await browser.close()}
});
