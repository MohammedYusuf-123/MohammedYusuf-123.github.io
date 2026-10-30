const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    menu.setAttribute('aria-expanded', 'false'); navigation.classList.remove('open'); menu.focus();
  }
});
document.querySelectorAll('.print-button').forEach(button => button.addEventListener('click', () => window.print()));
const filters = [...document.querySelectorAll('[data-filter]')];
filters.forEach(button => button.addEventListener('click', () => {
  const value = button.dataset.filter;
  filters.forEach(item => { item.classList.toggle('active',item === button); item.setAttribute('aria-pressed', String(item === button)); });
  let count = 0;
  document.querySelectorAll('.filter-item').forEach(item => { item.hidden = value !== 'all' && item.dataset.category !== value; if (!item.hidden) count++; });
  document.querySelector('.filter-status').textContent = `Showing ${count} ${count === 1 ? 'activity' : 'activities'}${value === 'all' ? '' : ' in ' + value}.`;
}));
const viewer = document.querySelector('.slide-viewer');
if (viewer) {
  const panels = [...viewer.querySelectorAll('.slide-panel')];
  const prev = viewer.querySelector('.slide-prev'), next = viewer.querySelector('.slide-next');
  let index = 0;
  viewer.tabIndex = 0; viewer.setAttribute('aria-label','Presentation slides'); viewer.setAttribute('role','region');
  const show = value => {
    index = Math.max(0, Math.min(value, panels.length - 1));
    panels.forEach((panel,i) => { panel.hidden = i !== index; });
    prev.disabled = index === 0; next.disabled = index === panels.length - 1;
    viewer.querySelector('.slide-counter').textContent = `${String(index+1).padStart(2,'0')} / ${panels.length}`;
  };
  prev.addEventListener('click', () => show(index-1)); next.addEventListener('click', () => show(index+1));
  viewer.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') { event.preventDefault(); show(index-1); } if (event.key === 'ArrowRight') { event.preventDefault(); show(index+1); } });
}
const video = window.PORTFOLIO_VIDEO;
const mount = document.querySelector('#video-mount');
if (mount && video?.src) {
  const source = new URL(video.src,window.location.href);
  if (['http:','https:','file:'].includes(source.protocol)) {
    const element = document.createElement(video.type === 'embed' ? 'iframe' : 'video');
    element.src = source.href;
    if (video.type === 'embed') { element.title = video.title; element.allowFullscreen = true; element.loading = 'lazy'; element.allow = 'fullscreen; picture-in-picture'; }
    else {
      element.controls = true; element.preload = 'metadata'; element.setAttribute('aria-label',video.title);
      if (video.captions) { const track = document.createElement('track'); track.kind='captions'; track.srclang='en'; track.label='English'; track.src=video.captions; track.default=true; element.append(track); }
    }
    mount.replaceChildren(element);
    const fallback = document.createElement('a'); fallback.className='text-link'; fallback.href=source.href; fallback.textContent='Open recording directly â†—'; mount.append(fallback);
    if (video.transcript) { const t=document.createElement('a'); t.href=video.transcript; t.textContent='Read transcript â†’'; t.className='text-link'; mount.append(t); }
    document.querySelectorAll('.feature-copy .caption').forEach(label => label.textContent='11 slides Â· Recorded presentation');
  }
}

// Mark the section currently being read without changing keyboard focus.
const sectionLinks = [...document.querySelectorAll('.artifact-sidebar a[href^="#"]')];
if (sectionLinks.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (!visible.length) return;
    sectionLinks.forEach(link => {
      if (link.hash === '#' + visible[0].target.id) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }, {rootMargin:'-10% 0px -50% 0px',threshold:0});
  sectionLinks.forEach(link => {const section=document.getElementById(link.hash.slice(1));if(section) observer.observe(section);});
}
