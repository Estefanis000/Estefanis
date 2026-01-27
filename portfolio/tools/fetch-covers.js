#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'assets', 'covers');
fs.mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
if(args.length === 0) {
  console.log('Uso: node tools/fetch-covers.js repo1 repo2 ...\n   o: node tools/fetch-covers.js --demo 6\n');
  process.exit(0);
}

let targets = [];
if(args[0] === '--demo'){
  const n = Number(args[1] || 6);
  for(let i=0;i<n;i++) targets.push(`demo-${i+1}`);
}else{
  targets = args;
}

function downloadImage(url, dest){
  return new Promise((resolve, reject)=>{
    const file = fs.createWriteStream(dest);
    https.get(url, (res)=>{
      if(res.statusCode >= 300 && res.statusCode < 400 && res.headers.location){
        // Follow redirect
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
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
  console.log(`Descargando ${targets.length} imágenes en ${outDir}`);
  for(let i=0;i<targets.length;i++){
    const name = targets[i];
    const url = `https://source.unsplash.com/800x600/?buenos-aires,architecture,sky&sig=${i}`;
    const dest = path.join(outDir, `${encodeURIComponent(name)}.jpg`);
    try{
      await downloadImage(url, dest);
      console.log('Guardado:', dest);
    }catch(err){
      console.error('Error al descargar', name, err.message);
    }
  }
  console.log('Hecho.');
})();
