const data = window.galleryData || {};
const order = Object.keys(data);
const sidebar = document.querySelector('.sidebar');
const hero = document.querySelector('#hero');
const modelStatus = document.querySelector('#model-status');
const statusLabel = document.querySelector('#model-status-label');
const loadTrack = document.querySelector('#load-track');
const loadFill = document.querySelector('#load-fill');
const loadValue = document.querySelector('#load-value');
const viewer = document.querySelector('.viewer');
const fullscreenPanel = document.querySelector('#fullscreen-panel');
const infoButton = document.querySelector('#fullscreen-info');
const cards = new Map();

// Only request 3B previews as their cards enter the scrollable list.
const thumbObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('src', entry.target.dataset.src);
        thumbObserver.unobserve(entry.target);
      }
    }, { root: sidebar, rootMargin: '100px' })
  : null;

for (const [id, item] of Object.entries(data)) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'card';
  card.dataset.id = id;
  card.setAttribute('aria-pressed', 'false');

  const thumb = document.createElement('div');
  thumb.className = 'thumb';
  if (item.thumbnail) {
    const image = document.createElement('img');
    image.src = item.thumbnail;
    image.alt = '';
    image.loading = 'lazy';
    thumb.append(image);
  } else {
    const preview = document.createElement('model-viewer');
    preview.dataset.src = item.model;
    preview.setAttribute('camera-orbit', '25deg 75deg auto');
    preview.setAttribute('disable-zoom', '');
    preview.setAttribute('aria-hidden', 'true');
    thumb.append(preview);
    if (thumbObserver) thumbObserver.observe(preview);
    else preview.setAttribute('src', item.model);
  }

  const label = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = item.cardName || item.name;
  const subtitle = document.createElement('span');
  subtitle.textContent = item.short || item.life;
  label.append(title, subtitle);
  card.append(thumb, label);
  card.addEventListener('click', () => select(id));
  sidebar.append(card);
  cards.set(id, card);
}

let viewerUnavailable = false;
let currentId = order[0];

function setLoadingProgress(value) {
  const percent = Math.round(Math.max(0, Math.min(1, value)) * 100);
  loadFill.style.width = `${percent}%`;
  loadValue.textContent = `%${percent}`;
  loadTrack.setAttribute('aria-valuenow', String(percent));
}

function showLoading() {
  statusLabel.textContent = '3B model yükleniyor…';
  loadTrack.hidden = false;
  loadValue.hidden = false;
  setLoadingProgress(0);
  viewer.classList.add('is-loading');
  modelStatus.hidden = false;
}

function showLoadError(message) {
  statusLabel.textContent = message;
  loadTrack.hidden = true;
  loadValue.hidden = true;
  viewer.classList.add('is-loading');
  modelStatus.hidden = false;
}

hero.addEventListener('progress', event => {
  if (event.detail.reason === 'model-load') setLoadingProgress(event.detail.totalProgress);
});
hero.addEventListener('load', () => {
  modelStatus.hidden = true;
  viewer.classList.remove('is-loading');
});
hero.addEventListener('error', () => {
  showLoadError('3B model yüklenemedi. Bağlantınızı kontrol edip sayfayı yenileyin.');
});
document.querySelector('#model-viewer-script').addEventListener('error', () => {
  viewerUnavailable = true;
  showLoadError('3B görüntüleyici yüklenemedi. Bağlantınızı kontrol edip sayfayı yenileyin.');
});
window.addEventListener('load', () => {
  if (customElements.get('model-viewer')) return;
  viewerUnavailable = true;
  showLoadError('3B görüntüleyici yüklenemedi. Bağlantınızı kontrol edip sayfayı yenileyin.');
});

function renderFacts(list, facts) {
  const elements = facts.map(([heading, description]) => {
    const li = document.createElement('li');
    const bold = document.createElement('b');
    bold.textContent = `${heading}:`;
    li.append(bold, ` ${description}`);
    return li;
  });
  list.replaceChildren(...elements);
}

function select(id) {
  const item = data[id];
  if (!item) return;
  currentId = id;
  if (viewerUnavailable) {
    showLoadError('3B görüntüleyici yüklenemedi. Bağlantınızı kontrol edip sayfayı yenileyin.');
  } else if (hero.getAttribute('src') !== item.model) {
    showLoading();
    hero.setAttribute('src', item.model);
  }
  hero.alt = `${item.name} 3B modeli`;
  hero.cameraOrbit = '25deg 75deg 105%';

  document.querySelector('#kicker').textContent = item.category || '3B Eser';
  document.querySelector('#name').textContent = item.name;
  document.querySelector('#life').textContent = item.life;
  document.querySelector('#summary').textContent = item.summary;
  document.querySelector('#badge').textContent = item.badge || '';
  renderFacts(document.querySelector('#facts'), item.facts || []);

  document.querySelector('#fullscreen-title').textContent = item.name;
  document.querySelector('#fullscreen-name').textContent = item.name;
  document.querySelector('#fullscreen-life').textContent = item.life;
  document.querySelector('#fullscreen-summary').textContent = item.summary;
  renderFacts(document.querySelector('#fullscreen-facts'), item.facts || []);

  for (const [cardId, card] of cards) {
    const active = cardId === id;
    card.classList.toggle('active', active);
    card.setAttribute('aria-pressed', String(active));
  }
}

document.querySelector('#reset').addEventListener('click', () => {
  hero.cameraOrbit = '25deg 75deg 105%';
});

let rotating = false;
document.querySelector('#rotate').addEventListener('click', event => {
  rotating = !rotating;
  hero.autoRotate = rotating;
  event.currentTarget.textContent = rotating ? 'Durdur' : 'Döndür';
  event.currentTarget.setAttribute('aria-label', rotating ? 'Döndürmeyi durdur' : 'Otomatik döndür');
});

function moveSelection(step) {
  if (!order.length) return;
  select(order[(order.indexOf(currentId) + step + order.length) % order.length]);
}
document.querySelector('#previous').addEventListener('click', () => moveSelection(-1));
document.querySelector('#next').addEventListener('click', () => moveSelection(1));

infoButton.addEventListener('click', () => {
  const open = fullscreenPanel.classList.toggle('open');
  infoButton.textContent = open ? 'Bilgiyi kapat' : 'Bilgi';
  infoButton.setAttribute('aria-expanded', String(open));
});

document.querySelector('#fullscreen').addEventListener('click', async () => {
  try {
    if (viewer.requestFullscreen) await viewer.requestFullscreen();
    else viewer.classList.add('expanded');
  } catch {
    viewer.classList.add('expanded');
  }
});

function resetFullscreenUi() {
  viewer.classList.remove('expanded');
  fullscreenPanel.classList.remove('open');
  infoButton.textContent = 'Bilgi';
  infoButton.setAttribute('aria-expanded', 'false');
}
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) resetFullscreenUi();
});
document.querySelector('#fullscreen-exit').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  resetFullscreenUi();
});

if (order.length) select(order[0]);
else showLoadError('Galeride henüz eser yok.');
