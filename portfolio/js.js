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