/* ═══════════════════════════════════════════
   ENIGMA ALPHA — CART LOGIC
═══════════════════════════════════════════ */

let cart = [];

function openCart() {
  document.getElementById('cOv').classList.add('open');
  document.getElementById('cPanel').classList.add('open');
  goV('vCart');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cOv').classList.remove('open');
  document.getElementById('cPanel').classList.remove('open');
  document.body.style.overflow = '';
}

function changeQty(id, delta) {
  const s = styles.find(x => x.id === id);
  if (!s) return;

  let ci = cart.find(c => c.id === id);
  if (!ci && delta > 0) {
    cart.push({...s, qty: 1});
  } else if (ci) {
    ci.qty += delta;
    if (ci.qty <= 0) cart = cart.filter(c => c.id !== id);
  }

  updateCart();
  doRender(activeFilter);
  if (delta > 0) showFlash('Added to your session');
}

function removeItem(id) {
  cart = cart.filter(c => c.id !== id);
  updateCart();
  doRender(activeFilter);
}

function updateCart() {
  const total = cart.reduce((s, c) => s + Number(c.price) * c.qty, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);

  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartTotal').textContent = fmt(total);
  document.getElementById('chkTotal').textContent  = fmt(total);

  const cl = document.getElementById('cartList');
  if (!cart.length) {
    cl.innerHTML = '<div class="empty-msg">Your cart is empty.<br>Choose a style to get started.</div>';
    return;
  }

  cl.innerHTML = cart.map(c => {
    const imgHtml = c.img
      ? `<img class="ci-img" src="${c.img}" alt="${c.name}" loading="lazy"/>`
      : `<div class="ci-ph" aria-hidden="true">${c.icon}</div>`;
    return `
      <div class="c-item">
        ${imgHtml}
        <div style="flex:1;min-width:0">
          <div class="ci-name">${c.name}</div>
          <div class="ci-meta">${fmt(c.price)} each · ${c.duration}</div>
          <div class="ci-qrow">
            <button class="ci-qbtn" onclick="changeQty(${c.id},-1)" aria-label="Decrease quantity">−</button>
            <span class="ci-qnum" aria-label="${c.qty} selected">${c.qty}</span>
            <button class="ci-qbtn" onclick="changeQty(${c.id},1)" aria-label="Increase quantity">+</button>
            <span class="ci-subtotal">${fmt(c.price * c.qty)}</span>
          </div>
        </div>
        <button class="ci-rm" onclick="removeItem(${c.id})" aria-label="Remove ${c.name}">×</button>
      </div>`;
  }).join('');
}

function selM(el, m) {
  document.querySelectorAll('.pm').forEach(x => x.classList.remove('sel'));
  el.classList.add('sel');
  document.getElementById('accessBox').style.display = m === 'access' ? 'block' : 'none';
  document.getElementById('opayBox').style.display   = m === 'opay'   ? 'block' : 'none';
}

/* ── Receipt ── */
let pendingRcptData = null;
let pendingRcptName = null;

function handleRcpt(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { showFlash('Image too large. Max 10MB.'); return; }

  const r = new FileReader();
  r.onload = ev => {
    pendingRcptData = ev.target.result;
    pendingRcptName = file.name;

    const prev = document.getElementById('rcptPrev');
    if (prev) {
      document.getElementById('rcptThumb').src  = pendingRcptData;
      document.getElementById('rcptName').textContent = file.name;
      document.getElementById('rcptSize').textContent = (file.size / 1024).toFixed(1) + ' KB';
      prev.style.display = 'flex';
    }
  };
  r.readAsDataURL(file);
  e.target.value = '';
  showFlash('Receipt attached ✦');
}

function clearRcpt() {
  pendingRcptData = null;
  pendingRcptName = null;
  const p = document.getElementById('rcptPrev');
  if (p) p.style.display = 'none';
  const t = document.getElementById('rcptThumb');
  if (t) t.src = '';
}

/* ── Confirm booking ── */
function confirmPay() {
  const name  = document.getElementById('payName').value.trim();
  const phone = document.getElementById('payPhone').value.trim();
  if (!name)  { showFlash('Please enter your name');  return; }
  if (!phone) { showFlash('Please enter your phone'); return; }
  if (!cart.length) { showFlash('Your cart is empty'); return; }

  currentUser = name;
  const ref   = 'EA-' + uid();
  const total = document.getElementById('chkTotal').textContent;

  document.getElementById('sucRef').textContent = 'REF: ' + ref;

  // Add to owner messages
  ownerMessages.push({
    type: 'booking', from: name, time: nowT(), id: uid(), read: false,
    text: `New booking! Ref: ${ref} — ${name} — ${total}`,
    img: pendingRcptData, rcptName: pendingRcptName
  });
  updateUnreadBadge();

  // Add confirmation to chat
  chatMessages.push({
    type: 'owner',
    text: `Your booking (${ref}) is confirmed ✦ Total: ${total}. Please send your payment receipt here to verify. Shalom, ${name}!`,
    time: nowT(), id: uid()
  });
  if (pendingRcptData) {
    chatMessages.push({
      type: 'user', text: 'Payment receipt:', time: nowT(), id: uid(),
      img: pendingRcptData
    });
  }

  clearRcpt();
  goV('vSuccess');
}

function resetAll() {
  cart = [];
  updateCart();
  doRender(activeFilter);
  closeCart();
  goV('vCart');
  document.getElementById('payName').value  = '';
  document.getElementById('payPhone').value = '';
  clearRcpt();
}
