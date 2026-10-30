/** Run after `npm run build`; PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE select an existing browser installation. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(__dirname,'../public');
test('catalog filters, URL history and keyboard detail navigation',async()=>{
 const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');fs.readFile(file,(err,bytes)=>{if(err){res.writeHead(404).end();return;}const ext=path.extname(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp'})[ext]||'application/octet-stream');res.end(bytes);});});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try {
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true});
  const page=await browser.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/catalog/`,{waitUntil:'networkidle'});
  await page.getByLabel('Search').fill('particle');await page.getByLabel('Category').selectOption('component');
  assert.equal(new URL(page.url()).searchParams.get('q'),'particle');assert.equal(new URL(page.url()).searchParams.get('category'),'component');
  await page.goBack();assert.equal(await page.getByLabel('Search').inputValue(),'particle');assert.equal(await page.getByLabel('Category').inputValue(),'');
  await page.getByLabel('Framework').selectOption('webgpu');assert.equal(new URL(page.url()).searchParams.get('framework'),'webgpu');await page.goBack();
  await page.locator('.catalog-card').first().focus();await page.keyboard.press('Enter');await page.locator('.detail-info').waitFor();assert.match(page.url(),/\/catalog\/[^/]+\/[^/]+\//);await page.goBack();assert.equal(new URL(page.url()).searchParams.get('q'),'particle');assert.deepEqual(errors,[]);
 } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
});
