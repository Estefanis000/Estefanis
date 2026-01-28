// ============================================
// BANNER INTERACTIVO CON PARTÍCULAS
// ============================================

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.resize();
    this.init();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    const particleCount = Math.min(50, Math.floor(window.innerWidth / 15));
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
  }

  onMouseMove(e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    this.particles.forEach(particle => {
      const dx = mouseX - particle.x;
      const dy = mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 150) {
        const force = (150 - distance) / 150;
        particle.vx -= (dx / distance) * force * 0.5;
        particle.vy -= (dy / distance) * force * 0.5;
      }
    });
  }

  update() {
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      particle.vy += 0.05;

      if (particle.x < 0 || particle.x > this.canvas.width) {
        particle.vx *= -1;
        particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
      }
      if (particle.y < 0 || particle.y > this.canvas.height) {
        particle.vy *= -1;
        particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
      }
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Dibujar conexiones entre partículas
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          this.ctx.strokeStyle = `rgba(230, 166, 211, ${0.3 * (1 - distance / 120)})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
    
    // Dibujar partículas
    this.particles.forEach(particle => {
      this.ctx.fillStyle = `rgba(230, 166, 211, ${particle.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Glow effect
      this.ctx.fillStyle = `rgba(255, 182, 193, ${particle.opacity * 0.5})`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Inicializar sistema de partículas
const particlesCanvas = document.getElementById('particlesCanvas');
if (particlesCanvas) {
  const particleSystem = new ParticleSystem(particlesCanvas);
  particleSystem.animate();
}

// ============================================
// FIN BANNER INTERACTIVO
// ============================================

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
    {slug:'javascript',name:'JavaScript'}, {slug:'typescript',name:'TypeScript'}, {slug:'python',name:'Python'},
    {slug:'html5',name:'HTML5'}, {slug:'css3',name:'CSS3'}, {slug:'react',name:'React'}, 
    {slug:'nextdotjs',name:'Next.js'}, {slug:'node-dot-js',name:'Node.js'}, {slug:'tailwindcss',name:'Tailwind CSS'},
    {slug:'mongodb',name:'MongoDB'}, {slug:'postgresql',name:'PostgreSQL'}, {slug:'docker',name:'Docker'},
    {slug:'git',name:'Git'}, {slug:'amazonaws',name:'AWS'}
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

// ============================================
// FORMULARIO DE CONTACTO
// ============================================
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // Validación básica
    if (!name || !email || !message) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Por favor, ingresa un email válido.');
      return;
    }

    // Cambiar el texto del botón mientras se procesa
    const submitBtn = contactForm.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    try {
      // Enviar el correo usando Formspree o tu servicio preferido
      const response = await fetch('https://formspree.io/f/meoqkbla', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message
        })
      });

      if (response.ok) {
        alert('¡Mensaje enviado correctamente! Te contactaremos pronto.');
        contactForm.reset();
      } else {
        alert('Hubo un error al enviar el mensaje. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar el mensaje. Intenta de nuevo más tarde.');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

initContactForm();

// ============================================
// BOTÓN DE PROYECTOS - ABRE 4 REPOSITORIOS
// ============================================
function initProyectosButton() {
  const btnProyectos = document.getElementById('btnProyectos');
  if (!btnProyectos) return;

  const repos = [
    'https://github.com/teffanis/Buenosairespolisemia',
    'https://github.com/teffanis/2dapre.Tiendadelmaparas3d.Sylfhide',
    'https://github.com/teffanis/MovimientoStudio',
    'https://github.com/teffanis/AgustinJara.PH'
  ];

  // Si el elemento es un enlace, apuntarlo al perfil principal en GitHub
  if (btnProyectos.tagName.toLowerCase() === 'a') {
    btnProyectos.href = 'https://github.com/teffanis';
    btnProyectos.target = '_blank';
    btnProyectos.rel = 'noopener';
  } else {
    // Mantener compatibilidad: si es un botón, abrir el perfil en nueva pestaña
    btnProyectos.addEventListener('click', () => {
      window.open('https://github.com/teffanis', '_blank');
    });
  }

  // Cargar y mostrar estos 4 repositorios destacados en la página
  renderFeaturedSpecificRepos();
}

// Renderizar los 4 repositorios específicos con nombre y lenguaje
async function renderFeaturedSpecificRepos() {
  const container = document.getElementById('featuredReposGrid');
  const repoNames = [
    'Buenosairespolisemia',
    '2dapre.Tiendadelmaparas3d.Sylfhide',
    'MovimientoStudio',
    'AgustinJara.PH'
  ];

  try {
    const repoData = [];
    
    for (const repoName of repoNames) {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repoName}`);
      if (res.ok) {
        const data = await res.json();
        repoData.push(data);
      }
    }

    if (repoData.length === 0) {
      return;
    }

    container.innerHTML = '';
    
    repoData.forEach((repo, index) => {
      const card = document.createElement('a');
      card.href = repo.html_url;
      card.target = '_blank';
      card.rel = 'noopener';
      card.className = 'repo-item';
      card.style.animationDelay = `${index * 80}ms`;

      // Imagen miniatura: intenta cargar archivo local en assets/covers, sino fallback al avatar o Unsplash
      const thumb = document.createElement('div');
      thumb.className = 'repo-thumb';
      const img = document.createElement('img');
      const localCover = `assets/covers/${encodeURIComponent(repo.name)}.jpg`;
      img.src = localCover;
      img.alt = repo.name;
      img.loading = 'lazy';
      img.onerror = () => {
        if (repo.owner && repo.owner.avatar_url) img.src = repo.owner.avatar_url;
        else img.src = `https://source.unsplash.com/800x600/?code,${encodeURIComponent(repo.name)}`;
      };
      thumb.appendChild(img);
      card.appendChild(thumb);

      const title = document.createElement('h3');
      title.className = 'repo-name';
      title.textContent = repo.name;

      const langHolder = document.createElement('div');
      langHolder.className = 'repo-languages';

      // fetch languages breakdown
      (async ()=>{
        try{
          const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo.name}/languages`);
          if(!res.ok) throw new Error('No disponibles');
          const data = await res.json();
          const entries = Object.entries(data);
          if(entries.length === 0){
            langHolder.textContent = 'Lenguajes no disponibles';
            return;
          }
          entries.sort((a,b)=>b[1]-a[1]);
          langHolder.innerHTML = '';
          const total = entries.reduce((s,e)=>s+e[1],0);
          entries.forEach(([lang,bytes])=>{
            const pill = document.createElement('span');
            pill.className = 'language-tag';
            const pct = ((bytes/total)*100).toFixed(0);
            pill.textContent = `${lang} (${pct}%)`;
            langHolder.appendChild(pill);
          });
        }catch(e){
          langHolder.innerHTML = '<span class="language-tag">Lenguajes no disponibles</span>';
        }
      })();

      card.appendChild(title);
      card.appendChild(langHolder);
      container.appendChild(card);
    });

  } catch (err) {
    console.error('Error cargando repositorios destacados:', err);
  }
}

initProyectosButton();