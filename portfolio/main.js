const GITHUB_USER = 'teffanis';
const projectsList = document.getElementById('projects-list');

// Modal elements
const modal = document.getElementById('readme-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');

function b64_to_utf8(str) {
  // Decode base64 preserving UTF-8
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

async function fetchRepos(){
  try{
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`);
    if(!res.ok){
      throw new Error(`GitHub API error: ${res.status}`)
    }
    const repos = await res.json();
    if(!repos || repos.length===0){
      projectsList.innerHTML = '<p class="loading">No se encontraron repositorios públicos.</p>'
      return
    }
    renderRepos(repos);
  }catch(err){
    console.error(err);
    projectsList.innerHTML = `<p class="loading">Error al obtener proyectos (${err.message}). Prueba más tarde.</p>`;
  }
}

function openModal(){
  modal.setAttribute('aria-hidden','false');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  modal.setAttribute('aria-hidden','true');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  modalTitle.textContent = '';
  modalBody.innerHTML = '';
}

// Close modal on overlay or close button
document.addEventListener('click', (e)=>{
  if(e.target && e.target.matches('[data-close]')) closeModal();
});
// Close on Escape
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape') closeModal();
});

async function openReadme(repo){
  try{
    modalBody.innerHTML = 'Cargando...';
    modalTitle.textContent = repo.name;
    openModal();

    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo.name}/readme`);
    if(!res.ok) throw new Error('README no disponible');
    const data = await res.json();
    const md = b64_to_utf8(data.content);
    // Use marked (CDN included in HTML) to convert markdown to HTML
    modalBody.innerHTML = marked.parse(md);
  }catch(err){
    console.error(err);
    modalBody.innerHTML = `<p class="loading">No se pudo cargar README: ${err.message}</p>`;
  }
}

function escapeHtml(str){
  if(!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function renderRepos(repos){
  // Orden: mostrar destacados (por estrellas) primero
  const byStars = [...repos].sort((a,b)=>b.stargazers_count - a.stargazers_count);
  const topThree = byStars.slice(0,3).map(r=>r.name);

  projectsList.innerHTML = '';
  repos.forEach((repo, index)=>{
    const row = document.createElement('section');
    row.className = 'project-row';
    if(index % 2 === 1) row.classList.add('reverse');
    row.style.animationDelay = `${index * 80}ms`;

    const imgWrap = document.createElement('div');
    imgWrap.className = 'row-image';
    const imgDiv = document.createElement('div');
    imgDiv.className = 'img';
    const local = `assets/covers/${encodeURIComponent(repo.name)}.jpg`;
    imgDiv.style.backgroundImage = `url('${local}')`;
    // probe local
    const probe = new Image();
    probe.src = local;
    probe.onerror = ()=> imgDiv.style.backgroundImage = `url('https://source.unsplash.com/1200x900/?architecture,building,sky&sig=${index}')`;
    imgWrap.appendChild(imgDiv);

    const overlayTitle = document.createElement('div');
    overlayTitle.className = 'overlay-title';
    overlayTitle.textContent = repo.name;
    imgWrap.appendChild(overlayTitle);

    const content = document.createElement('div');
    content.className = 'row-content';
    const inner = document.createElement('div');
    inner.className = 'content-inner';

    const safeDesc = escapeHtml(repo.description || 'Sin descripción.');
    inner.innerHTML = `
      <h3 class="row-title">${escapeHtml(repo.name)}</h3>
      <p class="row-desc">${safeDesc}</p>
      <div class="meta-row">
        <span class="meta-pill">${repo.language || '—'}</span>
        <span class="meta-pill">★ ${repo.stargazers_count}</span>
        <span class="meta-pill">Actualizado: ${new Date(repo.pushed_at).toLocaleDateString()}</span>
      </div>
      <div>
        <button class="btn-outline readme-btn">Ver README</button>
        <a class="btn" href="${repo.homepage || repo.html_url}" target="_blank" rel="noopener">${repo.homepage ? 'Ver demo' : 'Ver en GitHub'}</a>
      </div>
    `;

    content.appendChild(inner);

    // badge
    if(topThree.includes(repo.name)){
      const badge = document.createElement('span');
      badge.className = 'row-badge';
      badge.textContent = 'Destacado';
      row.appendChild(badge);
    }

    // events
    row.appendChild(imgWrap);
    row.appendChild(content);

    // click row opens repo
    row.addEventListener('click', ()=> window.open(repo.html_url, '_blank'));

    // parallax on image (subtle)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!prefersReduced){
      row.addEventListener('mousemove', (e)=>{
        const rect = row.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const tx = x * 18;
        const ty = y * 12;
        imgDiv.style.transform = `translate(${tx}px, ${ty}px) scale(1.03)`;
      });
      row.addEventListener('mouseleave', ()=> imgDiv.style.transform = '');
    }

    // readme button handler
    row.addEventListener('click', (e)=>{
      if(e.target && e.target.matches('.readme-btn')){
        e.stopPropagation();
        openReadme(repo);
      }
    });

    projectsList.appendChild(row);
  })
}

// Renders featured modules (top N by stars) with languages detail
async function renderFeatured(repos, n = 3){
  const featuredList = document.getElementById('featured-list');
  featuredList.innerHTML = '';
  const byStars = [...repos].sort((a,b)=>b.stargazers_count - a.stargazers_count);
  const featured = byStars.slice(0,n);

  for(let i=0;i<featured.length;i++){
    const repo = featured[i];
    const module = document.createElement('section');
    module.className = 'featured-module';
    if(i % 2 === 1) module.classList.add('reverse');
    module.style.animationDelay = `${i * 80}ms`;

    const imgWrap = document.createElement('div');
    imgWrap.className = 'featured-image';
    const imgDiv = document.createElement('div');
    imgDiv.className = 'img';
    const local = `assets/covers/${encodeURIComponent(repo.name)}.jpg`;
    imgDiv.style.backgroundImage = `url('${local}')`;
    const probe = new Image();
    probe.src = local;
    probe.onerror = ()=> imgDiv.style.backgroundImage = `url('https://source.unsplash.com/1200x900/?architecture,building,sky&sig=feat${i}')`;
    imgWrap.appendChild(imgDiv);

    const content = document.createElement('div');
    content.className = 'featured-content';
    const title = document.createElement('h3');
    title.className = 'featured-title';
    title.textContent = repo.name;

    const desc = document.createElement('p');
    desc.className = 'featured-desc';
    desc.textContent = repo.description || 'Sin descripción.';

    const langsHolder = document.createElement('div');
    langsHolder.className = 'languages-list';
    langsHolder.textContent = 'Cargando lenguajes...';

    // fetch languages breakdown
    (async ()=>{
      try{
        const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo.name}/languages`);
        if(!res.ok) throw new Error('No disponibles');
        const data = await res.json();
        const entries = Object.entries(data);
        if(entries.length === 0){
          langsHolder.textContent = 'Lenguajes no disponibles';
          return;
        }
        // sort by bytes desc
        entries.sort((a,b)=>b[1]-a[1]);
        langsHolder.innerHTML = '';
        const total = entries.reduce((s,e)=>s+e[1],0);
        entries.forEach(([lang,bytes])=>{
          const pct = Math.round((bytes/total)*100);
          const pill = document.createElement('span');
          pill.className = 'language-pill';
          pill.textContent = `${lang} • ${pct}%`;
          langsHolder.appendChild(pill);
        });
      }catch(err){
        langsHolder.textContent = 'Lenguajes no disponibles';
      }
    })();

    const metaRow = document.createElement('div');
    metaRow.className = 'meta-row';
    metaRow.innerHTML = `<span class="meta-pill">★ ${repo.stargazers_count}</span><span class="meta-pill">Actualizado: ${new Date(repo.pushed_at).toLocaleDateString()}</span>`;

    const actions = document.createElement('div');
    actions.innerHTML = `<button class="btn-outline readme-btn">Ver README</button> <a class="btn" href="${repo.homepage || repo.html_url}" target="_blank" rel="noopener">${repo.homepage ? 'Ver demo' : 'Ver en GitHub'}</a>`;

    content.appendChild(title);
    content.appendChild(desc);
    content.appendChild(langsHolder);
    content.appendChild(metaRow);
    content.appendChild(actions);

    // badge
    if(byStars.slice(0,n).map(r=>r.name).includes(repo.name)){
      const badge = document.createElement('span');
      badge.className = 'row-badge';
      badge.textContent = 'Destacado';
      module.appendChild(badge);
    }

    module.appendChild(imgWrap);
    module.appendChild(content);

    // events
    module.addEventListener('click', ()=> window.open(repo.html_url, '_blank'));
    module.addEventListener('click', (e)=>{
      if(e.target && e.target.matches('.readme-btn')){
        e.stopPropagation();
        openReadme(repo);
      }
    });

    featuredList.appendChild(module);
  }
}

// Update fetchRepos to render featured separately
async function fetchRepos(){
  try{
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`);
    if(!res.ok){
      throw new Error(`GitHub API error: ${res.status}`)
    }
    const repos = await res.json();
    if(!repos || repos.length===0){
      document.getElementById('featured-list').innerHTML = '<p class="loading">No se encontraron repositorios públicos.</p>'
      projectsList.innerHTML = '<p class="loading">No se encontraron repositorios públicos.</p>'
      return
    }

    // render featured (top 3) and the rest below
    renderFeatured(repos, 3);
    const byStars = [...repos].sort((a,b)=>b.stargazers_count - a.stargazers_count);
    const topThreeNames = new Set(byStars.slice(0,3).map(r=>r.name));
    const rest = repos.filter(r=>!topThreeNames.has(r.name));
    renderRepos(rest);
  }catch(err){
    console.error(err);
    document.getElementById('featured-list').innerHTML = `<p class="loading">Error al obtener proyectos (${err.message}). Prueba más tarde.</p>`;
    projectsList.innerHTML = `<p class="loading">Error al obtener proyectos (${err.message}). Prueba más tarde.</p>`;
  }
}

fetchRepos();

// Inicializa el banner interactivo del hero
function initHero(){
  const hero = document.querySelector('.hero');
  if(!hero) return;
  const layers = hero.querySelectorAll('.layer');
  let mouseX = 0, mouseY = 0;
  let posX = 0, posY = 0;
  const friction = 1/12;

  function onMove(e){
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    mouseX = (x - rect.width/2)/rect.width;
    mouseY = (y - rect.height/2)/rect.height;
  }

  hero.addEventListener('mousemove', onMove);
  hero.addEventListener('touchmove', onMove, {passive:true});

  function update(){
    posX += (mouseX - posX) * friction;
    posY += (mouseY - posY) * friction;
    layers.forEach(layer=>{
      const depth = parseFloat(layer.dataset.depth) || 0.03;
      const translateX = posX * depth * 60; // px
      const translateY = posY * depth * 40; // px
      layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Inicializa y controla el video del hero (fallbacks y prefers-reduced-motion)
function initHeroVideo(){
  const hero = document.querySelector('.hero');
  const video = document.getElementById('hero-video');
  if(!hero || !video) return;

  const setReduced = (isReduced)=>{
    if(isReduced){
      video.pause();
      hero.classList.add('reduced-motion');
    }else{
      hero.classList.remove('reduced-motion');
      // try to play
      const p = video.play();
      if(p && typeof p.then === 'function'){
        p.catch(err=>{
          console.warn('Hero video play failed:', err);
          hero.classList.add('no-video');
        });
      }
    }
  };

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  setReduced(mq.matches);
  mq.addEventListener && mq.addEventListener('change', (e)=> setReduced(e.matches));

  // Try to play and detect failures
  const playPromise = video.play();
  if(playPromise && typeof playPromise.then === 'function'){
    playPromise.then(()=>{
      // good
      hero.classList.remove('no-video');
    }).catch((err)=>{
      console.warn('Hero video playback blocked or failed:', err);
      hero.classList.add('no-video');
    });
  }

  // If video errors or takes too long, fallback
  video.addEventListener('error', ()=> hero.classList.add('no-video'));
  setTimeout(()=>{
    if(video.readyState < 2){
      hero.classList.add('no-video');
    }
  }, 3500);
}

function initReveal(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.about');
  if(prefersReduced){
    targets.forEach(t=>t.classList.add('in-view'));
    return;
  }
  const obs = new IntersectionObserver((entries, o)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        o.unobserve(entry.target);
      }
    });
  }, {threshold: 0.15});
  targets.forEach(t=>obs.observe(t));
}

initHeroVideo();

initHero();

initReveal();

// Render languages icons in About: tries local assets/langs/<slug>.svg first, falls back to CDN
(function renderLanguages(){
  const list = [
    {slug:'javascript',name:'JavaScript'}, {slug:'typescript',name:'TypeScript'}, {slug:'html5',name:'HTML5'},
    {slug:'css3',name:'CSS3'}, {slug:'node-dot-js',name:'Node.js'}, {slug:'python',name:'Python'},
    {slug:'react',name:'React'}, {slug:'vue-dot-js',name:'Vue.js'}, {slug:'angular',name:'Angular'},
    {slug:'svelte',name:'Svelte'}, {slug:'nextdotjs',name:'Next.js'}, {slug:'express',name:'Express'},
    {slug:'django',name:'Django'}, {slug:'flask',name:'Flask'}, {slug:'ruby',name:'Ruby'},
    {slug:'rubyonrails',name:'Ruby on Rails'}, {slug:'java',name:'Java'}, {slug:'spring',name:'Spring'},
    {slug:'go',name:'Go'}, {slug:'rust',name:'Rust'}, {slug:'csharp',name:'C#'}, {slug:'php',name:'PHP'},
    {slug:'laravel',name:'Laravel'}, {slug:'graphql',name:'GraphQL'}, {slug:'docker',name:'Docker'},
    {slug:'kubernetes',name:'Kubernetes'}, {slug:'amazonaws',name:'AWS'}, {slug:'git',name:'Git'},
    {slug:'tailwindcss',name:'Tailwind CSS'}, {slug:'bootstrap',name:'Bootstrap'}, {slug:'styledcomponents',name:'styled-components'},
    {slug:'redux',name:'Redux'}, {slug:'jest',name:'Jest'}, {slug:'webpack',name:'Webpack'}, {slug:'vite',name:'Vite'},
    {slug:'babel',name:'Babel'}, {slug:'postgresql',name:'PostgreSQL'}, {slug:'mysql',name:'MySQL'}, {slug:'mongodb',name:'MongoDB'}
  ];
  const container = document.getElementById('languages-icons');
  if(!container) return;
  list.forEach((ico, i)=>{
    const fig = document.createElement('figure');
    fig.className = 'lang';
    fig.style.animationDelay = `${i*40}ms`;
    const img = document.createElement('img');
    img.alt = ico.name;
    img.loading = 'lazy';
    const local = `assets/langs/${ico.slug}.svg`;
    img.src = local;
    img.onerror = ()=>{
      if(!img.dataset.fallbacked){
        img.dataset.fallbacked = '1';
        img.src = `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${ico.slug}.svg`;
      }
    };
    const cap = document.createElement('figcaption');
    cap.textContent = ico.name;
    fig.appendChild(img);
    fig.appendChild(cap);
    container.appendChild(fig);
  });
})();

initHeroVideo();

initHero();

initReveal();

// Trigger hero entrance animation slightly after paint
const _hero = document.querySelector('.hero');
setTimeout(()=>{ if(_hero) _hero.classList.add('mounted'); }, 120);

// Reveal footer icons when footer enters viewport
function initFooterIconsReveal(){
  const footerIcons = document.querySelector('.footer-icons');
  if(!footerIcons) return;
  const footer = document.querySelector('footer');
  if(!footer) return;
  const obs = new IntersectionObserver((entries, o)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        footerIcons.classList.add('in-view');
        o.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  obs.observe(footer);
}
initFooterIconsReveal();
