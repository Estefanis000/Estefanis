// Simple gallery script: carga imágenes desde assets/covers y abre modal
const galleryGrid = document.getElementById('gallery-grid');
const modalImg = document.getElementById('image-modal');
const imageBody = document.getElementById('image-body');

function openModalImg(html){
  imageBody.innerHTML = html;
  modalImg.classList.add('open');
  modalImg.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeModalImg(){
  modalImg.classList.remove('open');
  modalImg.setAttribute('aria-hidden','true');
  imageBody.innerHTML = '';
  document.body.style.overflow = '';
}

document.addEventListener('click', (e)=>{
  if(e.target && e.target.matches('[data-close]')) closeModalImg();
});

// Intentar cargar las imágenes desde assets/covers/ (x6 demo)
const IMAGES = [];
for(let i=0;i<8;i++){
  IMAGES.push(`assets/covers/demo-${i+1}.jpg`);
}

IMAGES.forEach((src, idx)=>{
  const card = document.createElement('article');
  card.className = 'project-card';
  const cover = document.createElement('div');
  cover.className = 'project-cover';
  const img = document.createElement('img');
  img.src = src;
  img.alt = `Galería ${idx+1}`;
  img.loading = 'lazy';
  img.onerror = () => { img.src = `https://source.unsplash.com/800x600/?buenos-aires,architecture,sky&sig=${idx}` }
  cover.appendChild(img);
  card.appendChild(cover);

  card.addEventListener('click', ()=>{
    const html = `<img src="${img.src}" style="width:100%;height:auto;display:block;border-radius:8px;">`;
    openModalImg(html);
  });

  galleryGrid.appendChild(card);
});

// Si estamos en la página proyectos, renderizar los repositorios destacados
document.addEventListener('DOMContentLoaded', ()=>{
  const featuredContainer = document.getElementById('featuredReposGrid');
  if(!featuredContainer) return;

  const repoNames = [
    'Buenosairespolisemia',
    '2dapre.Tiendadelmaparas3d.Sylfhide',
    'MovimientoStudio',
    'AgustinJara.PH'
  ];

  (async function renderFeaturedOnProyectos(){
    try{
      for(let i=0;i<repoNames.length;i++){
        const name = repoNames[i];
        const res = await fetch(`https://api.github.com/repos/teffanis/${name}`);
        if(!res.ok) continue;
        const repo = await res.json();

        const module = document.createElement('section');
        module.className = 'featured-module';
        if(i % 2 === 1) module.classList.add('reverse');
        // Añadir clase de animación lateral según el índice (pares: desde la izquierda, impares: desde la derecha)
        if(i % 2 === 0) module.classList.add('slide-in-left'); else module.classList.add('slide-in-right');
        module.style.animationDelay = `${i*160}ms`;

        const imgWrap = document.createElement('div');
        imgWrap.className = 'featured-image';
        const imgDiv = document.createElement('div');
        imgDiv.className = 'img';
        const local = `assets/covers/${encodeURIComponent(repo.name)}.jpg`;
        imgDiv.style.backgroundImage = `url('${local}')`;
        const probe = new Image();
        probe.src = local;
        probe.onerror = ()=> imgDiv.style.backgroundImage = `url('https://source.unsplash.com/1200x900/?code,programming&sig=${i}')`;
        imgWrap.appendChild(imgDiv);

        const content = document.createElement('div');
        content.className = 'featured-content';
        const title = document.createElement('h3');
        title.className = 'featured-title';
        title.textContent = repo.name;

        const langsHolder = document.createElement('div');
        langsHolder.className = 'languages-list';
        langsHolder.textContent = 'Cargando lenguajes...';

        (async ()=>{
          try{
            const lr = await fetch(`https://api.github.com/repos/teffanis/${repo.name}/languages`);
            if(!lr.ok) throw new Error('no');
            const data = await lr.json();
            const entries = Object.entries(data);
            if(entries.length===0){ langsHolder.textContent = 'Lenguajes no disponibles'; return; }
            entries.sort((a,b)=>b[1]-a[1]);
            langsHolder.innerHTML = '';
            const total = entries.reduce((s,e)=>s+e[1],0);
            entries.forEach(([lang,bytes])=>{
              const pill = document.createElement('span');
              pill.className = 'language-pill';
              const pct = ((bytes/total)*100).toFixed(0);
              pill.textContent = `${lang} (${pct}%)`;
              langsHolder.appendChild(pill);
            });
          }catch(e){ langsHolder.textContent = 'Lenguajes no disponibles'; }
        })();

        const desc = document.createElement('p');
        desc.className = 'featured-desc';
        desc.textContent = repo.description || 'Sin descripción.';

        const link = document.createElement('a');
        link.href = repo.html_url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Ver en GitHub';
        link.className = 'repo-link';

        content.appendChild(title);
        content.appendChild(desc);
        content.appendChild(langsHolder);
        content.appendChild(link);

        module.appendChild(imgWrap);
        module.appendChild(content);
        featuredContainer.appendChild(module);
      }
    }catch(err){ console.error('Error cargando destacados:', err); }
  })();
});