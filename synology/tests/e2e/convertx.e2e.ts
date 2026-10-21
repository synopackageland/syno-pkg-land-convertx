import {test} from '@e2e-dev/web';
import {expect} from 'e2e';
import {dsmPage,openDesktop,registerDsmSecrets,handleDialogs} from '@synopackageland/cli/e2e';
import {join} from 'node:path';
import {readFile,stat,writeFile} from 'node:fs/promises';

async function launch(app:any) {
  await openDesktop(app);
  const desktop=dsmPage();await registerDsmSecrets(desktop);
  if (process.env.CONVERTX_E2E_TRUST_CERTIFICATE==='1') {
    const cdp=await desktop.context().browser()!.newBrowserCDPSession();
    await cdp.send('Security.setIgnoreCertificateErrors',{ignore:true});
  }
  await desktop.locator('#sds-taskbar button.start-button-img').click();
  const [page]=await Promise.all([
    desktop.context().waitForEvent('page',{timeout:30_000}),
    desktop.getByRole('menuitem',{name:'ConvertX',exact:true}).click(),
  ]);
  if (process.env.CONVERTX_E2E_TRUST_CERTIFICATE==='1') {
    const cdp=await page.context().newCDPSession(page);
    await cdp.send('Security.setIgnoreCertificateErrors',{ignore:true});
  }
  page.setDefaultTimeout(20_000);
  await page.locator('input[type=file]').waitFor({state:'attached',timeout:60_000});
  expect(await page.locator('input[type=password]').count()).toBe(0);
  expect(new URL(page.url()).protocol).toBe('https:');
  if (process.env.CONVERTX_E2E_URL) expect(new URL(page.url()).origin).toBe(new URL(process.env.CONVERTX_E2E_URL).origin);
  return page;
}

test('DSM main menu, three conversions with downloads, sign out and reopen',
  {session:'authorized',timeout:300_000},async({app,browser})=>{
  await handleDialogs(browser);
  const page=await launch(app);
  const fixture=process.env.CONVERTX_E2E_FIXTURES;
  const output=process.env.DSM_E2E_OUTPUT_DIR;
  if (!fixture || !output) throw new Error('Set private fixture and evidence directories');
  for (const [input,search,converter] of [['input.png','jpeg','imagemagick'],['input.mp4','webm','ffmpeg'],['input.txt','pdf','libreoffice']]) {
    await page.goto(new URL('/',page.url()).href);
    const uploaded=page.waitForResponse((r:any)=>new URL(r.url()).pathname==='/upload' && r.request().method()==='POST',{timeout:30_000});
    await page.locator('input[type=file]').setInputFiles(join(fixture,input));
    expect((await uploaded).status()).toBe(200);
    await page.locator('input[name=convert_to_search]').fill(search);
    await page.locator('button.target[data-value="'+search+','+converter+'"]').first().click();
    await page.locator('input[type=submit]').click();
    const downloadLink=page.locator('a[download]:not([download$=".tar"])').last();
    await downloadLink.waitFor({timeout:90_000});
    const [download]=await Promise.all([page.waitForEvent('download'),downloadLink.click()]);
    const target=join(output,download.suggestedFilename());
    await download.saveAs(target);
    expect((await stat(target)).size).toBeGreaterThan(0);
    const bytes=await readFile(target);
    if (search==='pdf') expect(bytes.subarray(0,5).toString()).toBe('%PDF-');
    if (search==='jpeg') expect(bytes.subarray(0,2).toString('hex')).toBe('ffd8');
    if (search==='webm') expect(bytes.subarray(0,4).toString('hex')).toBe('1a45dfa3');
  }
  const logout=page.waitForResponse((r:any)=>new URL(r.url()).pathname==='/_sso/logout' && r.request().method()==='POST');
  await page.evaluate(()=>{const form=document.createElement('form');form.method='POST';form.action='/_sso/logout';document.body.appendChild(form);form.submit();});
  expect((await logout).status()).toBe(302);
  await page.close();
  const reopened=await launch(app);
  await reopened.screenshot({path:join(output,'reopened.png')});
});

test('a DSM user lacking this app permission receives gateway 403',
  {session:'denied',timeout:180_000},async({app})=>{
  await openDesktop(app);
  const desktop=dsmPage();await registerDsmSecrets(desktop);
  const url=process.env.CONVERTX_E2E_URL;
  if (!url) throw new Error('Set CONVERTX_E2E_URL to the installed gateway');
  const denied=await desktop.context().newPage();
  if (process.env.CONVERTX_E2E_TRUST_CERTIFICATE==='1') {
    const cdp=await denied.context().newCDPSession(denied);
    await cdp.send('Security.setIgnoreCertificateErrors',{ignore:true});
  }
  const origin=new URL(url).origin;
  const forbidden=denied.waitForResponse((response:any)=>new URL(response.url()).origin===origin && response.status()>=400,{timeout:30_000});
  const observed=await Promise.all([forbidden,denied.goto(url)]).catch(async(error)=>{
    await writeFile(join(process.env.DSM_E2E_OUTPUT_DIR!,'denied-state.json'),JSON.stringify({url:denied.url(),upstreamVisible:await denied.locator('input[type=file]').count(),text:await denied.locator('body').innerText()}));throw error;
  });
  await writeFile(join(process.env.DSM_E2E_OUTPUT_DIR!,'denied-response.json'),JSON.stringify({status:observed[0].status(),path:new URL(observed[0].url()).pathname,body:await observed[0].text()}));
  expect(observed[0].status()).toBe(403);
  expect(await denied.locator('input[type=file]').count()).toBe(0);
  await denied.close();
});
