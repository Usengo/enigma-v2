/* ═══════════════════════════════════════════
   ENIGMA ALPHA — OWNER DASHBOARD
═══════════════════════════════════════════ */

function changePin() {
  const p1  = document.getElementById('newPin1').value;
  const p2  = document.getElementById('newPin2').value;
  const msg = document.getElementById('pinMsg');

  if (!p1 || p1.length < 4) {
    msg.style.color = 'var(--ruby)';
    msg.textContent = 'PIN must be 4 digits.';
    return;
  }
  if (p1 !== p2) {
    msg.style.color = 'var(--ruby)';
    msg.textContent = 'PINs do not match.';
    return;
  }

  msg.style.color = 'var(--gold)';
  msg.textContent = 'PIN updated successfully ✦';
  document.getElementById('newPin1').value = '';
  document.getElementById('newPin2').value = '';
  setTimeout(() => msg.textContent = '', 3000);
}

/* ═══════════════════════════════════════════
   OWNER LIST — render all styles for editing
═══════════════════════════════════════════ */

function renderOwnerList() {
  const el = document.getElementById('ownerList');
  if (!el) return;

  if (!STYLES_DATA.length) {
    el.innerHTML = '<div class="no-msgs">No styles yet. Add one above.</div>';
    return;
  }

  el.innerHTML = STYLES_DATA.map(s => `
    <div class="owner-style-row" id="orow-${s.id}">
      <div class="orow-thumb">
        ${s.img
          ? `<img src="${s.img}" alt="${s.name}" style="width:100%;height:100%;object-fit:cover;border-radius:4px"/>`
          : `<span style="font-size:1.3rem">${s.icon || '✦'}</span>`}
      </div>
      <div class="orow-info">
        <div class="orow-name">${s.name}</div>
        <div class="orow-meta">₦${Number(s.price).toLocaleString()} · ${s.duration} · ${s.cat}</div>
      </div>
      <div class="orow-actions">
        <button class="eb" onclick="openEditForm(${s.id})">Edit</button>
        <button class="db" onclick="deleteStyle(${s.id})">✕</button>
      </div>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════
   OPEN EDIT FORM — populate fields for a style
═══════════════════════════════════════════ */

function openEditForm(id) {
  const s = STYLES_DATA.find(x => x.id === id);
  if (!s) return;

  document.getElementById('eId').value    = s.id;
  document.getElementById('eName').value  = s.name;
  document.getElementById('ePrice').value = s.price;
  document.getElementById('eDur').value   = s.duration;
  document.getElementById('eDesc').value  = s.desc;
  document.getElementById('eIcon').value  = s.icon || '';

  /* Category select */
  const catEl = document.getElementById('eCat');
  if (catEl) catEl.value = s.cat;

  /* Image preview */
  const prevWrap = document.getElementById('editImgPrev');
  const prevImg  = document.getElementById('editImgEl');
  if (s.img) {
    prevImg.src           = s.img;
    prevWrap.style.display = 'flex';
  } else {
    prevImg.src           = '';
    prevWrap.style.display = 'none';
  }

  /* Clear any newly-staged image from a previous edit session */
  _editStagedImg = null;

  /* Show the form and scroll to it */
  const wrap = document.getElementById('editFormWrap');
  document.getElementById('editFormTitle').textContent = `Edit — ${s.name}`;
  wrap.style.display = 'block';
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ═══════════════════════════════════════════
   SAVE EDIT — persist changes to localStorage
═══════════════════════════════════════════ */

/* Holds a newly-uploaded image (base64) during an edit session */
let _editStagedImg = null;

function saveEdit() {
  const id    = parseInt(document.getElementById('eId').value);
  const idx   = STYLES_DATA.findIndex(x => x.id === id);
  if (idx === -1) return;

  const name  = document.getElementById('eName').value.trim();
  const price = parseInt(document.getElementById('ePrice').value);
  const dur   = document.getElementById('eDur').value.trim();
  const desc  = document.getElementById('eDesc').value.trim();
  const icon  = document.getElementById('eIcon').value.trim();
  const cat   = document.getElementById('eCat').value;

  if (!name || isNaN(price)) {
    flash('Name and price are required.', 'error');
    return;
  }

  /* Apply staged image if one was uploaded, otherwise keep existing */
  const img = _editStagedImg !== null ? _editStagedImg : STYLES_DATA[idx].img;

  STYLES_DATA[idx] = { ...STYLES_DATA[idx], name, price, dur, desc, icon, cat, img,
    duration: dur };   /* keep both dur and duration in sync */

  /* ── PERSIST ── */
  saveStyles();

  /* Refresh public grid and owner list */
  if (typeof renderGrid === 'function')  renderGrid();
  renderOwnerList();

  /* Hide form and confirm */
  document.getElementById('editFormWrap').style.display = 'none';
  _editStagedImg = null;
  flash('Style saved ✦', 'success');
}

/* ═══════════════════════════════════════════
   IMAGE HANDLING for edit form
═══════════════════════════════════════════ */

function handleStyleImg(event, mode) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    const data = ev.target.result;

    if (mode === 'new') {
      /* new-style form */
      document.getElementById('newImgEl').src           = data;
      document.getElementById('newImgPrev').style.display = 'flex';
      /* store on a temp var that addStyle() reads */
      window._newStagedImg = data;

    } else {
      /* edit form */
      _editStagedImg = data;
      document.getElementById('editImgEl').src            = data;
      document.getElementById('editImgPrev').style.display = 'flex';
    }
  };
  reader.readAsDataURL(file);
  event.target.value = ''; /* reset so same file can be re-selected */
}

function clearEditImg() {
  _editStagedImg = null;
  document.getElementById('editImgEl').src             = '';
  document.getElementById('editImgPrev').style.display  = 'none';
  /* also clear from the current style in memory so save removes it */
  const id  = parseInt(document.getElementById('eId').value);
  const idx = STYLES_DATA.findIndex(x => x.id === id);
  if (idx !== -1) STYLES_DATA[idx].img = null;
}

function clearNewImg() {
  window._newStagedImg = null;
  document.getElementById('newImgEl').src              = '';
  document.getElementById('newImgPrev').style.display   = 'none';
}

/* ═══════════════════════════════════════════
   ADD STYLE
═══════════════════════════════════════════ */

function addStyle() {
  const name  = document.getElementById('nName').value.trim();
  const price = parseInt(document.getElementById('nPrice').value);
  const cat   = document.getElementById('nCat').value;
  const dur   = document.getElementById('nDur').value.trim();
  const desc  = document.getElementById('nDesc').value.trim();
  const icon  = document.getElementById('nIcon').value.trim();
  const img   = window._newStagedImg || null;

  if (!name || isNaN(price)) {
    flash('Name and price are required.', 'error');
    return;
  }

  const newId = Date.now();
  STYLES_DATA.push({ id: newId, name, price, cat, duration: dur, dur, desc, icon, img });

  /* ── PERSIST ── */
  saveStyles();

  if (typeof renderGrid === 'function') renderGrid();
  renderOwnerList();

  /* Clear form */
  ['nName','nPrice','nDur','nDesc','nIcon'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('nCat').value = 'classic';
  clearNewImg();
  flash('Style added ✦', 'success');
}

/* ═══════════════════════════════════════════
   DELETE STYLE
═══════════════════════════════════════════ */

function deleteStyle(id) {
  if (!confirm('Delete this style? This cannot be undone.')) return;
  STYLES_DATA = STYLES_DATA.filter(s => s.id !== id);
  saveStyles();
  if (typeof renderGrid === 'function') renderGrid();
  renderOwnerList();
  flash('Style deleted.', 'info');
}

/* ═══════════════════════════════════════════
   RENDER OWNER LIST on dashboard open
═══════════════════════════════════════════ */

/* Call this whenever the owner dashboard becomes visible */
function onOwnerDashOpen() {
  renderOwnerList();
}

/* ═══════════════════════════════════════════
   FLASH HELPER (uses existing flashMsg div)
═══════════════════════════════════════════ */

function flash(msg, type = 'success') {
  const el = document.getElementById('flashMsg');
  if (!el) return;
  el.textContent  = msg;
  el.className    = `flash flash-${type} show`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3000);
}