#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');

const icons = [
  {slug:'javascript', name:'JavaScript'},
  {slug:'typescript', name:'TypeScript'},
  {slug:'html5', name:'HTML5'},
  {slug:'css3', name:'CSS3'},
  {slug:'node-dot-js', name:'Node.js'},
  {slug:'python', name:'Python'},
  {slug:'react', name:'React'},
  {slug:'vue-dot-js', name:'Vue.js'},
  {slug:'angular', name:'Angular'},
  {slug:'svelte', name:'Svelte'},
  {slug:'nextdotjs', name:'Next.js'},
  {slug:'express', name:'Express'},
  {slug:'django', name:'Django'},
  {slug:'flask', name:'Flask'},
  {slug:'ruby', name:'Ruby'},
  {slug:'rubyonrails', name:'Ruby on Rails'},
  {slug:'java', name:'Java'},
  {slug:'spring', name:'Spring'},
  {slug:'go', name:'Go'},
  {slug:'rust', name:'Rust'},
  {slug:'csharp', name:'C#'},
  {slug:'php', name:'PHP'},
  {slug:'laravel', name:'Laravel'},
  {slug:'graphql', name:'GraphQL'},
  {slug:'docker', name:'Docker'},
  {slug:'kubernetes', name:'Kubernetes'},
  {slug:'amazonaws', name:'AWS'},
  {slug:'git', name:'Git'},
  {slug:'tailwindcss', name:'Tailwind CSS'},
  {slug:'bootstrap', name:'Bootstrap'},
  {slug:'styledcomponents', name:'styled-components'},
  {slug:'redux', name:'Redux'},
  {slug:'jest', name:'Jest'},
  {slug:'webpack', name:'Webpack'},
  {slug:'vite', name:'Vite'},
  {slug:'babel', name:'Babel'},
  {slug:'postgresql', name:'PostgreSQL'},
  {slug:'mysql', name:'MySQL'},
  {slug:'mongodb', name:'MongoDB'}
];

const outDir = path.join(__dirname, '..', 'assets', 'langs');
fs.mkdirSync(outDir, { recursive: true });

function download(url, dest){
  return new Promise((resolve,reject)=>{
    const file = fs.createWriteStream(dest);
    https.get(url, (res)=>{
      if(res.statusCode>=300 && res.statusCode<400 && res.headers.location){
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if(res.statusCode !== 200){
        reject(new Error('HTTP ' + res.statusCode));
        return;
      }
      res.pipe(file);
      file.on('finish', ()=> file.close(resolve));
    }).on('error', (err)=>{
      fs.unlink(dest, ()=>{});
      reject(err);
    });
  });
}

(async ()=>{
  console.log('Descargando iconos a', outDir);
  let succeeded = 0, failed = 0;
  for(const ico of icons){
    const slug = ico.slug;
    const dest = path.join(outDir, `${slug}.svg`);
    const url = `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${slug}.svg`;
    try{
      await download(url, dest);
      console.log('Guardado', slug);
      succeeded++;
    }catch(err){
      console.warn('Error', slug, err.message);
      failed++;
    }
  }
  console.log(`Hecho. Succeeded: ${succeeded}, Failed: ${failed}`);
  if(failed>0) console.log('Si faltan iconos, puedes reintentar o usar fallback CDN en runtime.');
})();
