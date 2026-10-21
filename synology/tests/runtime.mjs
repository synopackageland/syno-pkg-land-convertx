// Execute inside the official image as an arbitrary nonroot UID, with /var/tmp/convertx
// and /tmp writable and the remaining rootfs read-only. No mocked converters.
import {mkdir,writeFile,stat,readFile,rm,readdir} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
const base='/var/tmp/convertx/proof';
if (process.getuid() === 0) throw new Error('Nonroot proof requires a nonroot UID');
await mkdir(base,{recursive:true});
await mkdir(process.env.HOME,{recursive:true});
await mkdir(process.env.XDG_CACHE_HOME,{recursive:true});
if (process.env.XDG_CONFIG_HOME) await mkdir(process.env.XDG_CONFIG_HOME,{recursive:true});
await writeFile(base+'/input.txt','ConvertX nonroot conversion proof.\n');
await writeFile(base+'/input.md','# ConvertX\n\nNonroot conversion proof.\n');
await writeFile(base+'/input.html','<html><body><h1>ConvertX</h1><p>Nonroot proof.</p></body></html>');
await writeFile(base+'/input.svg','<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="red"/></svg>');
await writeFile(base+'/input.pbm','P1\n4 4\n0 1 1 0\n1 0 0 1\n1 0 0 1\n0 1 1 0\n');
await writeFile(base+'/input.obj','v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n');
await writeFile(base+'/input.json','{"proof":true}');
await writeFile(base+'/input.tex','\\documentclass{article}\n\\begin{document}Nonroot proof.\\end{document}\n');
await writeFile(base+'/input.vcf','BEGIN:VCARD\nVERSION:3.0\nFN:Example Person\nEMAIL:example@example.org\nEND:VCARD\n');
await exec('magick',['-size','32x32','xc:red',base+'/input.png']);
await exec('ffmpeg',['-v','error','-f','lavfi','-i','color=c=blue:s=64x64:d=1','-y',base+'/input.mp4']);
// Each adapter is imported from the official release's compiled JS, not the
// fork checkout (which may already include subsequent upstream development).
const cases=[
 ['imagemagick','input.png','png','jpeg','image.jpeg'],
 ['graphicsmagick','input.png','png','jpeg','gm.jpeg'],
 ['vips','input.png','png','webp','image.webp'],
 ['ffmpeg','input.mp4','mp4','webm','video.webm'],
 ['libreoffice','input.txt','txt','pdf','input.pdf'],
 ['pandoc','input.md','markdown','html','pandoc.html'],
 ['pandoc','input.md','markdown','pdf','pandoc.pdf'],
 ['calibre','input.txt','txt','epub','book.epub'],
 ['assimp','input.obj','obj','stl','model.stl'],
 ['dasel','input.json','json','yaml','output.yaml'],
 ['inkscape','input.svg','svg','png','inkscape.png'],
 ['resvg','input.svg','svg','png','resvg.png'],
 ['libjxl','input.png','png','jxl','image.jxl'],
 ['libjxl','image.jxl','jxl','png','jxl.png'],
 ['vtracer','input.png','png','svg','traced.svg'],
 ['potrace','input.pbm','pbm','svg','potrace.svg'],
 ['xelatex','input.tex','tex','pdf','input.pdf'],
 ['dvisvgm','input.pdf','pdf','svg','dvi.svg'],
 ['pdftops','input.pdf','pdf','eps','output.eps'],
 ['markitdown','input.html','html','md','output.md'],
 ['vcf','input.vcf','vcf','csv','contacts.csv'],
];
const results=[];
const originalLog=console.log,originalError=console.error;
console.log=(...v)=>originalError(...v);
for (const [converter,input,from,to,output] of cases) {
 try {
  await rm(base+'/'+output,{force:true});
  const module=await import('/app/dist/src/converters/'+converter+'.js');
  await module.convert(base+'/'+input,from,to,base+'/'+output);
  const bytes=(await stat(base+'/'+output)).size;
  if (!bytes) throw new Error('Empty output');
  if (to==='pdf' && !(await readFile(base+'/'+output)).subarray(0,5).equals(Buffer.from('%PDF-'))) throw new Error('Invalid PDF');
  results.push({converter,from,to,ok:true,bytes});
 } catch(e) { results.push({converter,from,to,ok:false,error:String(e).slice(0,1000)}); }
}
try {
 const fixture=process.env.CONVERTX_PROOF_HEIF;
 if (!fixture) throw new Error('Set CONVERTX_PROOF_HEIF to a real external HEIF fixture');
 const {convert}=await import('/app/dist/src/converters/libheif.js');
 for (const name of await readdir(base)) if (/^heif(?:-\d+)?\.png$/.test(name)) await rm(base+'/'+name);
 await convert(fixture,'heic','png',base+'/heif.png');
 const images=(await readdir(base)).filter(name=>/^heif(?:-\d+)?\.png$/.test(name));
 if (!images.length) throw new Error('No decoded HEIF image');
 const sizes=await Promise.all(images.map(async name=>(await stat(base+'/'+name)).size));
 if (sizes.some(size=>!size)) throw new Error('Empty HEIF output');
 results.push({converter:'libheif',ok:true,images:images.length,bytes:sizes.reduce((a,b)=>a+b,0)});
} catch(e) {results.push({converter:'libheif',ok:false,error:String(e).slice(0,1000)});}
try {
 await exec('perl',['-MEmail::Outlook::Message','-e','print $Email::Outlook::Message::VERSION']);
 if (!process.env.CONVERTX_PROOF_MSG) {
  results.push({converter:'msgconvert',ok:null,executable:true,reason:'No MSG fixture; conversion unverified'});
 } else {
  await rm(base+'/message.eml',{force:true});
  const {convert}=await import('/app/dist/src/converters/msgconvert.js');
  await convert(process.env.CONVERTX_PROOF_MSG,'msg','eml',base+'/message.eml');
  const bytes=(await stat(base+'/message.eml')).size;
  if (!bytes) throw new Error('Empty EML output');
  results.push({converter:'msgconvert',ok:true,bytes});
 }
} catch(e){results.push({converter:'msgconvert',ok:false,error:String(e).slice(0,1000)});}
originalLog(JSON.stringify({uid:process.getuid(),gid:process.getgid(),results},null,2));
if (results.some(r=>r.ok===false)) process.exitCode=1;
