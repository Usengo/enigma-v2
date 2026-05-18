/* ═══════════════════════════════════════════
   ENIGMA ALPHA — STUDIO CHAT
═══════════════════════════════════════════ */

let chatMessages  = [];
let ownerMessages = [];
let currentUser   = '';

const AUTO_REPLIES = [
  'Thank you! We have received your message and will confirm shortly. Shalom ✦',
  'Receipt received! Godswill will personally verify your payment. Peace be with you!',
  'Received! Your booking is being confirmed. Shalom — may your day be blessed. ✦',
  'Thank you! We look forward to welcoming you. Shalom ✦',
  'Your message has been received. Enigma Alpha Barber Studio thanks you. Shalom! ✦'
];

function initChat() {
  if (!chatMessages.length) {
    chatMessages.push({
      type: 'owner',
      text: 'Welcome to Enigma Alpha Barber Studio! ✦ How can we assist you? After payment, send your receipt here for fast confirmation. Shalom.',
      time: nowT(), id: uid()
    });
  }
}

function renderChat() {
  initChat();
  const box = document.getElementById('chatMsgs');
  box.innerHTML = chatMessages.map(m => `
    <div class="msg-row ${m.type === 'owner' ? 'owner' : 'user'}">
      <div>
        <div class="msg-bubble">
          ${m.text}
          ${m.img ? `<img class="rcpt-msg-img" src="${m.img}" alt="Payment receipt" loading="lazy"/>` : ''}
        </div>
        <div class="msg-meta">${m.type === 'owner' ? 'Studio' : 'You'} · ${m.time}</div>
      </div>
    </div>
  `).join('');
  box.scrollTop = box.scrollHeight;
}

function sendMsg() {
  const inp  = document.getElementById('chatInput');
  const text = inp.value.trim();
  if (!text && !pendingRcptData) return;
  if (!currentUser) currentUser = 'Customer';

  const msg = {
    type: 'user',
    text: text || (pendingRcptData ? 'Payment receipt sent.' : ''),
    time: nowT(), id: uid(),
    from: currentUser,
    img:  pendingRcptData,
    rcptName: pendingRcptName
  };

  chatMessages.push(msg);
  ownerMessages.push({...msg, read: false});
  updateUnreadBadge();

  inp.value = '';
  clearRcpt();
  renderChat();
  showTyping();
}

function showTyping() {
  const box = document.getElementById('chatMsgs');
  const t   = document.createElement('div');
  t.className = 'msg-row owner';
  t.id        = 'typingEl';
  t.innerHTML = `
    <div>
      <div class="msg-bubble">
        <div class="typing-ind">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>`;
  box.appendChild(t);
  box.scrollTop = box.scrollHeight;

  setTimeout(() => {
    const el = document.getElementById('typingEl');
    if (el) el.remove();
    chatMessages.push({
      type: 'owner',
      text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
      time: nowT(), id: uid()
    });
    renderChat();
  }, 1600);
}

function chatEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMsg();
  }
}

function updateUnreadBadge() {
  const n = ownerMessages.filter(m => !m.read).length;
  const b = document.getElementById('ubadge');
  if (!b) return;
  if (n > 0) { b.style.display = 'inline-block'; b.textContent = n + ' new'; }
  else        { b.style.display = 'none'; }
}

function renderOwnerMsgs() {
  const list = document.getElementById('ownerMsgsList');
  ownerMessages.forEach(m => m.read = true);
  updateUnreadBadge();

  if (!ownerMessages.length) {
    list.innerHTML = '<div class="no-msgs">No customer messages yet.</div>';
    return;
  }

  list.innerHTML = [...ownerMessages].reverse().map(m => `
    <div class="omsg${m.read ? '' : ' unread'}">
      <div class="omsg-hd">
        <span class="omsg-from">${m.from || 'Customer'}</span>
        <span class="omsg-time">${m.time}</span>
      </div>
      <div class="omsg-body">${m.text}</div>
      ${m.img ? `<img class="omsg-img" src="${m.img}" alt="${m.rcptName || 'receipt'}" title="${m.rcptName || 'receipt'}" loading="lazy"/>` : ''}
      <div class="reply-row">
        <input type="text" placeholder="Reply to ${m.from || 'customer'}..." id="rpl_${m.id}" onkeydown="if(event.key==='Enter')sendReply('${m.id}')"/>
        <button class="reply-send" onclick="sendReply('${m.id}')">Reply</button>
      </div>
    </div>
  `).join('');
}

function sendReply(msgId) {
  const inp = document.getElementById('rpl_' + msgId);
  if (!inp || !inp.value.trim()) return;
  chatMessages.push({ type: 'owner', text: inp.value.trim(), time: nowT(), id: uid() });
  inp.value = '';
  showFlash('Reply sent ✦');
}
