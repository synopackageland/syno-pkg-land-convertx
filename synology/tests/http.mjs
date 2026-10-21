// Run with Bun inside the running, isolated official image. This is an upstream
// HTTP proof only; it does not replace DSM gateway or package lifecycle evidence.
import assert from 'node:assert/strict';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
const origin=process.env.CONVERTX_PROOF_URL || 'http://127.0.0.1:3000';
const cookies=new Map();
async function request(path,options={}) {
 const response=await fetch(origin+path,{...options,redirect:'manual',headers:{...options.headers,Cookie:[...cookies].map(([k,v])=>k+'='+v).join('; ')}});
 for (const value of response.headers.getSetCookie()) { const [pair]=value.split(';'); const i=pair.indexOf('=');cookies.set(pair.slice(0,i),pair.slice(i+1)); }
 return response;
}
const cases=[['input.png','jpeg,imagemagick','image/jpeg'],['input.mp4','webm,ffmpeg','video/webm'],['input.txt','pdf,libreoffice','application/pdf']];
const results=[];
await mkdir('/var/tmp/convertx/proof/downloaded',{recursive:true});
for (let n=0;;n++) {
 try {const response=await fetch(origin+'/robots.txt');if (response.status===200) break;} catch {}
 if(n>=60) throw new Error('Upstream readiness timeout');
 await Bun.sleep(500);
}
for (const [name,target,type] of cases) {
 const home=await request('/');assert.equal(home.status,200);
 const html=await home.text();assert.ok(!html.includes('type="password"'));
 const data=await readFile('/var/tmp/convertx/proof/'+name);
 const form=new FormData();form.append('file',new File([data],name));
 assert.equal((await request('/upload',{method:'POST',body:form})).status,200);
 const response=await request('/convert',{method:'POST',body:new URLSearchParams({convert_to:target,file_names:JSON.stringify([name])})});
 assert.equal(response.status,302);
 const resultPath=response.headers.get('location');assert.match(resultPath,/^\/results\//);
 let result='';
 for (let n=0;n<120;n++) {
  result=await (await request(resultPath)).text();
  if (result.includes('/download/') || result.includes('/output/')) break;
  await Bun.sleep(500);
 }
 const links=[...result.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&'));
 const link=links.find(x=>x.includes('/download/') && !x.endsWith('.tar')) || links.find(x=>x.includes('/output/'));
 assert.ok(link,'No single-file download found for '+name+'; '+resultPath);
 const download=await request(link);assert.equal(download.status,200);
 const bytes=Buffer.from(await download.arrayBuffer());assert.ok(bytes.length>0);
 if (target.startsWith('pdf,')) assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
 if (target.startsWith('jpeg,')) assert.equal(bytes.subarray(0,2).toString('hex'),'ffd8');
 if (target.startsWith('webm,')) assert.equal(bytes.subarray(0,4).toString('hex'),'1a45dfa3');
 // A fresh upstream browser identity must see the same shared-space file.
 cookies.clear();
 assert.equal((await request('/')).status,200);
 const shared=await request(link);assert.equal(shared.status,200);
 assert.deepEqual(Buffer.from(await shared.arrayBuffer()),bytes);
 await writeFile('/var/tmp/convertx/proof/downloaded/'+name+'.'+target.split(',')[0],bytes);
 results.push({input:name,target,download:true,secondSessionSharedDownload:true,bytes:bytes.length,contentType:download.headers.get('content-type')});
}
console.log(JSON.stringify({upstream_http_only:true,results},null,2));
