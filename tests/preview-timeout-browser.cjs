const {test}=require('node:test');const assert=require('node:assert/strict');const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const base=process.env.PREVIEW_BASE_URL||'http://127.0.0.1:4179';
test('late mount and seek replies cannot revive failed iframe; explicit retry works',async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true});
 try{for(const scenario of ['mount','seek']){
  const page=await browser.newPage();await page.addInitScript(()=>{const original=window.setTimeout;window.setTimeout=function(fn,delay,...args){return original(fn,delay===15000||delay===10000?100:delay,...args)};});
  const fake=`window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin)return;let r=e.data;if(r.type==='hello')parent.postMessage({channel:'videoml-preview',type:'boot'},location.origin);if(r.type==='mount'||r.type==='seek')setTimeout(()=>parent.postMessage({channel:'videoml-preview',type:'ready',id:r.id},location.origin),${scenario==='mount'?"r.type==='mount'?350:0":"r.type==='seek' && r.frame===20?350:0"});});`;
  await page.route('**/catalog-preview/preview.js',route=>route.fulfill({contentType:'application/javascript',body:fake}));
  await page.goto(`${base}/catalog/component/echo-smear/`,{waitUntil:'networkidle'});
  if(scenario==='seek'){await page.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.textContent==='Play'&&!b.disabled));await page.getByLabel('Frame').fill('20');}
  await page.locator('[role=alert]').waitFor();assert.match(await page.locator('[role=alert]').innerText(),/timed out/);assert.equal(await page.locator('iframe').count(),0);await page.waitForTimeout(500);assert.equal(await page.locator('iframe').count(),0);assert.equal(await page.getByRole('button',{name:'Play',exact:true}).isDisabled(),true);
  await page.unroute('**/catalog-preview/preview.js');await page.getByRole('button',{name:'Apply changes'}).click();await page.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.textContent==='Play'&&!b.disabled),{timeout:15000});assert.equal(await page.locator('[role=alert]').count(),0);assert.equal(await page.locator('iframe').count(),1);await page.close();
 }}finally{await browser.close()}
});
