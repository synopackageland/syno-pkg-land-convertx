import {test} from '@e2e-dev/web';
import {expect} from 'e2e';
import {dsmPage,openDesktop,registerDsmSecrets,handleDialogs} from '@synopackageland/cli/e2e';
import {join} from 'node:path';
import {readFile,stat} from 'node:fs/promises';

async function launch(app:any) {
  await openDesktop(app);
  const desktop=dsmPage();await registerDsmSecrets(desktop);
  await desktop.locator('#sds-taskbar button.start-button-img').click();
  const [page]=await Promise.all([
    desktop.context().waitForEvent('page',{timeout:30_000}),
    desktop.getByRole('menuitem',{name:'ConvertX',exact:true}).click(),
  ]);
  await page.locator('input[type=file]').waitFor({state:'attached',timeout:90_000});
  expect(await page.locator('input[type=password]').count()).toBe(0);
  expect(new URL(page.url()).protocol).toBe('https:');
  return page;
}

test('DSM main menu, three conversions with downloads, sign out and reopen',
  {session:'authorized',timeout:300_000},async({app,browser})=>{
  await handleDialogs(browser);
  const page=await launch(app);
  const fixture=process.env.CONVERTX_E2E_FIXTURES;
  const output=process.env.DSM_E2E_OUTPUT_DIR;
  if (!fixture || !output) throw new Error('Set private fixture and evidence directories');
  for (const [input,search] of [['input.png','jpeg'],['input.mp4','webm'],['input.txt','pdf']]) {
    await page.goto(new URL('/',page.url()).href);
    await page.locator('input[type=file]').setInputFiles(join(fixture,input));
    await page.locator('input[name=convert_to_search]').fill(search);
    await page.locator('button.target').filter({hasText:new RegExp('^'+search+'$','i')}).first().click();
    await page.locator('input[type=submit]').click();
    const downloadLink=page.locator('a[download]:not([download$=".tar"])').last();
    await downloadLink.waitFor({timeout:90_000});
    const [download]=await Promise.all([page.waitForEvent('download'),downloadLink.click()]);
    const target=join(output,download.suggestedFilename());
    await download.saveAs(target);
    expect((await stat(target)).size).toBeGreaterThan(0);
    if (search==='pdf') expect((await readFile(target)).subarray(0,5).toString()).toBe('%PDF-');
  }
  const signedOut=await page.request.post(new URL('/_sso/logout',page.url()).href,{headers:{Origin:new URL(page.url()).origin},maxRedirects:0});
  expect(signedOut.status()).toBe(302);
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
  const origin=new URL(url).origin;
  const forbidden=denied.waitForResponse((response:any)=>new URL(response.url()).origin===origin && response.status()===403,{timeout:90_000});
  await denied.goto(url);
  expect((await forbidden).status()).toBe(403);
  expect(await denied.locator('input[type=file]').count()).toBe(0);
  await denied.close();
});
