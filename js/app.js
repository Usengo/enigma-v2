/* ═══════════════════════════════════════════
   ENIGMA ALPHA — MAIN APP
   Theme, pages, skeleton, styles grid
═══════════════════════════════════════════ */

/* ── Global state ── */
let styles       = STYLES_DATA.map(s => ({...s}));
let isDark       = true;
let activeFilter = 'all';
let nextId       = 200;

/* ── Helpers ── */
const fmt  = n   => '₦' + Number(n).toLocaleString();
const nowT = ()  => new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
const uid  = ()  => Math.random().toString(36).slice(2,8).toUpperCase();

function showFlash(msg) {
  const f = document.getElementById('flashMsg');
  f.textContent = msg;
  f.classList.add('show');
  setTimeout(() => f.classList.remove('show'), 2400);
}

/* ── Theme toggle ── */
function toggleTheme() {
  isDark = !isDark;
  document.getElementById('appRoot').setAttribute('data-theme', isDark ? '' : 'light');
  document.getElementById('tIcon').textContent  = isDark ? '☀' : '☾';
  document.getElementById('tLabel').textContent = isDark ? 'Light' : 'Dark';
  // Update PWA theme-color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = isDark ? '#080604' : '#FAF6EE';
}

/* ── Page navigation ── */
function showPage(p) {
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.getElementById(p + 'Page').classList.add('active');
  ['Home','About','Owner'].forEach(n => {
    const b = document.getElementById('n' + n);
    if (b) b.classList.toggle('on', n.toLowerCase() === p);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Panel view switcher ── */
function goV(v) {
  document.querySelectorAll('.pview').forEach(x => x.classList.remove('on'));
  const el = document.getElementById(v);
  if (el) el.classList.add('on');
  if (v === 'vChat') renderChat();
}

/* ── Open chat directly (footer) ── */
function openChatDirect() {
  openCart();
  setTimeout(() => goV('vChat'), 50);
}

/* ── Skeleton loader ── */
function buildSkels(n) {
  const g = document.getElementById('skelGrid');
  g.innerHTML = Array.from({length: n}).map(() => `
    <div class="skel-card">
      <div class="skel" style="width:100%;aspect-ratio:4/3"></div>
      <div class="skel" style="width:30%;height:9px"></div>
      <div class="skel" style="width:72%;height:15px"></div>
      <div class="skel" style="width:100%;height:9px"></div>
      <div class="skel" style="width:82%;height:9px"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:.7rem;border-top:1px solid var(--border)">
        <div class="skel" style="width:48px;height:9px"></div>
        <div class="skel" style="width:80px;height:28px"></div>
      </div>
    </div>
  `).join('');
  g.style.display = 'grid';
  document.getElementById('stylesGrid').style.display = 'none';
}

/* ── Render styles grid ── */
function renderGrid(filter, skip) {
  activeFilter = filter;
  if (!skip) {
    buildSkels(6);
    setTimeout(() => doRender(filter), 950);
  } else {
    doRender(filter);
  }
}

function doRender(filter) {
  const items = filter === 'all' ? styles : styles.filter(s => s.cat === filter);
  const g = document.getElementById('stylesGrid');

  if (!items.length) {
    g.innerHTML = `<div style="padding:2.5rem;text-align:center;color:var(--text3);font-size:10px;letter-spacing:2px;grid-column:1/-1;font-weight:600">No styles here yet.</div>`;
  } else {
    g.innerHTML = items.map(s => {
      const ci  = cart.find(c => c.id === s.id);
      const qty = ci ? ci.qty : 0;
      const imgHtml = s.img
        ? `<img class="card-img" src="${s.img}" alt="${s.name}" loading="lazy"/>`
        : `<div class="card-ph" aria-hidden="true">${s.icon}</div>`;

      return `
        <div class="style-card" role="listitem">
          <div class="card-img-wrap">
            ${imgHtml}
            <div class="card-price">${fmt(s.price)}</div>
          </div>
          <div class="card-cat">${s.cat}</div>
          <div class="card-name">${s.name}</div>
          <div class="card-desc">${s.desc}</div>
          <div class="card-foot">
            <span class="card-dur">${s.duration}</span>
            ${qty > 0
              ? `<div class="qty-ctrl" role="group" aria-label="Quantity for ${s.name}">
                   <button class="qty-btn" onclick="changeQty(${s.id},-1)" aria-label="Decrease">−</button>
                   <span class="qty-num" aria-label="${qty} selected">${qty}</span>
                   <button class="qty-btn" onclick="changeQty(${s.id},1)" aria-label="Increase">+</button>
                 </div>`
              : `<button class="add-first" onclick="changeQty(${s.id},1)" aria-label="Add ${s.name} to cart">Add to Cart</button>`
            }
          </div>
        </div>`;
    }).join('');
  }

  document.getElementById('skelGrid').style.display  = 'none';
  g.style.display = 'grid';
}

function filterGrid(cat, btn) {
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderGrid(cat);
}

/* ── Style image upload ── */
let newImgData  = null;
let editImgData = null;

function handleStyleImg(e, mode) {
  const file = e.target.files[0];
  if (!file) return;
  // Validate size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showFlash('Image too large. Max 5MB.');
    return;
  }
  const r = new FileReader();
  r.onload = ev => {
    if (mode === 'new') {
      newImgData = ev.target.result;
      document.getElementById('newImgEl').src   = newImgData;
      document.getElementById('newImgPrev').style.display = 'block';
    } else {
      editImgData = ev.target.result;
      document.getElementById('editImgEl').src  = editImgData;
      document.getElementById('editImgPrev').style.display = 'block';
    }
  };
  r.readAsDataURL(file);
  e.target.value = '';
}

function clearNewImg() {
  newImgData = null;
  document.getElementById('newImgPrev').style.display = 'none';
}
function clearEditImg() {
  editImgData = null;
  document.getElementById('editImgPrev').style.display = 'none';
}

/* ── Styles CRUD ── */
function renderOwnerList() {
  const list = document.getElementById('ownerList');
  if (!styles.length) {
    list.innerHTML = '<div class="no-msgs">No styles yet.</div>';
    return;
  }
  list.innerHTML = styles.map(s => `
    <div class="o-item">
      <div class="o-thumb">
        ${s.img ? `<img src="${s.img}" alt="${s.name}" loading="lazy"/>` : `<span>${s.icon}</span>`}
      </div>
      <div>
        <div class="o-item-name">${s.name}</div>
        <div class="o-item-meta">${s.cat} · ${s.duration}</div>
      </div>
      <div class="o-item-price">${fmt(s.price)}</div>
      <button class="ebtn" onclick="openEdit(${s.id})" aria-label="Edit ${s.name}">Edit</button>
      <button class="dbtn" onclick="delStyle(${s.id})" aria-label="Delete ${s.name}">Del</button>
    </div>
  `).join('');
}

function openEdit(id) {
  const s = styles.find(x => x.id === id);
  if (!s) return;
  [['eId',id],['eName',s.name],['ePrice',s.price],['eCat',s.cat],['eDur',s.duration],['eDesc',s.desc],['eIcon',s.icon]]
    .forEach(([fid, val]) => { const el = document.getElementById(fid); if (el) el.value = val; });

  editImgData = s.img || null;
  const pw = document.getElementById('editImgPrev');
  const pi = document.getElementById('editImgEl');
  if (s.img) { pi.src = s.img; pw.style.display = 'block'; }
  else { pw.style.display = 'none'; }

  document.getElementById('editFormTitle').textContent = 'Editing: ' + s.name;
  document.getElementById('editFormWrap').style.display = 'block';
  document.getElementById('editFormWrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function saveEdit() {
  const id  = parseInt(document.getElementById('eId').value);
  const idx = styles.findIndex(x => x.id === id);
  if (idx < 0) return;

  const price = parseInt(document.getElementById('ePrice').value);
  if (isNaN(price) || price <= 0) { showFlash('Enter a valid price'); return; }

  styles[idx] = {
    ...styles[idx],
    name:     document.getElementById('eName').value.trim()  || styles[idx].name,
    price,
    cat:      document.getElementById('eCat').value,
    duration: document.getElementById('eDur').value.trim()   || styles[idx].duration,
    desc:     document.getElementById('eDesc').value.trim()  || styles[idx].desc,
    icon:     document.getElementById('eIcon').value.trim()  || styles[idx].icon,
    img:      editImgData !== null ? editImgData : styles[idx].img,
  };

  renderOwnerList();
  doRender(activeFilter);
  updateCart();
  document.getElementById('editFormWrap').style.display = 'none';
  editImgData = null;
  clearEditImg();
  showFlash('Style updated ✦');
}

function delStyle(id) {
  if (!confirm('Remove this style from the menu?')) return;
  styles = styles.filter(s => s.id !== id);
  cart   = cart.filter(c => c.id !== id);
  renderOwnerList();
  doRender(activeFilter);
  updateCart();
  showFlash('Style removed');
}

function addStyle() {
  const name  = document.getElementById('nName').value.trim();
  const price = parseInt(document.getElementById('nPrice').value);
  if (!name)          { showFlash('Enter a style name');  return; }
  if (isNaN(price) || price <= 0) { showFlash('Enter a valid price'); return; }

  styles.push({
    id:       nextId++,
    name,
    price,
    cat:      document.getElementById('nCat').value,
    duration: document.getElementById('nDur').value.trim()  || '30 min',
    desc:     document.getElementById('nDesc').value.trim() || 'Premium barber service.',
    icon:     document.getElementById('nIcon').value.trim() || '✦',
    img:      newImgData || null,
  });

  ['nName','nPrice','nDur','nDesc','nIcon'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('nCat').value = 'classic';
  newImgData = null;
  clearNewImg();

  renderOwnerList();
  doRender(activeFilter);
  showFlash('New style added ✦');
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  renderGrid('all');
  updateCart();
  initChat();
});

/* ── PWA install prompt ── */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
});
