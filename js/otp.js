/* ═══════════════════════════════════════════
   ENIGMA ALPHA — EMAIL OTP AUTHENTICATION
   Uses EmailJS with One Time Password preset
   Variables: {{passcode}} and {{email}}
═══════════════════════════════════════════ */

const EJS_SVC     = 'service_n9l2rlg';
const EJS_TPL     = 'template_403oy4v';
const EJS_KEY     = '6sh6673BxjLRXkwlq';
const OWNER_EMAIL = 'godswillusen157@gmail.com';

let otpCode = '';

/* Initialise EmailJS once */
(function initEmailJS() {
  try { emailjs.init(EJS_KEY); }
  catch(e) { console.warn('EmailJS init failed:', e); }
})();

function setStatus(id, msg, type) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="sbox ${type}">${msg}</div>`;
}

/* ── Request OTP ── */
async function requestOTP() {
  const emailInput = document.getElementById('ownerEmail');
  const email      = emailInput ? emailInput.value.trim().toLowerCase() : '';
  const btn        = document.getElementById('sendOtpBtn');

  if (email !== OWNER_EMAIL) {
    setStatus('emailStatus', 'Access denied. Only the registered owner email is authorised.', 'err');
    return;
  }

  // Generate 6-digit OTP
  otpCode = Math.floor(100000 + Math.random() * 899999).toString();

  if (btn) {
    btn.disabled     = true;
    btn.innerHTML    = '<span class="spinner"></span>Sending OTP...';
  }
  setStatus('emailStatus', 'Sending your verification code — please wait...', 'inf');

  try {
    await emailjs.send(EJS_SVC, EJS_TPL, {
      passcode : otpCode,       /* {{passcode}} — EmailJS OTP preset variable */
      email    : OWNER_EMAIL,   /* {{email}}    — EmailJS OTP preset variable */
      to_name  : 'Godswill',
    });

    if (btn) { btn.disabled = false; btn.innerHTML = 'Send OTP to My Email →'; }
    setStatus('emailStatus', '✦ Code sent! Check your Gmail inbox — arrives within 60 seconds.', 'ok');

    document.getElementById('emailStep').style.display = 'none';
    document.getElementById('otpStep').style.display   = 'block';
    const o1 = document.getElementById('o1');
    if (o1) o1.focus();

  } catch (err) {
    if (btn) { btn.disabled = false; btn.innerHTML = 'Send OTP to My Email →'; }
    const detail = err && err.text ? err.text : (err && err.message ? err.message : JSON.stringify(err));
    setStatus('emailStatus',
      `Could not send OTP. Please check:<br>
       <strong>1.</strong> Gmail service is connected at emailjs.com → Email Services<br>
       <strong>2.</strong> Template body contains <code>{{passcode}}</code><br>
       <strong>3.</strong> Template "To Email" field contains <code>{{email}}</code><br>
       <strong>4.</strong> Public key is correct<br><br>
       Error: ${detail}`,
      'err');
  }
}

/* ── OTP input navigation ── */
function otpNext(el, nxtId) {
  if (el.value.length === 1) {
    const nxt = document.getElementById(nxtId);
    if (nxt) nxt.focus();
  }
}
function otpLast() {
  if (document.getElementById('o6').value.length === 1) verifyOTP();
}

/* ── Verify OTP ── */
function verifyOTP() {
  const ids    = ['o1','o2','o3','o4','o5','o6'];
  const entered = ids.map(id => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }).join('');

  if (entered === otpCode && otpCode !== '') {
    document.getElementById('loginStep').style.display = 'none';
    document.getElementById('ownerDash').style.display = 'block';
    renderOwnerList();
    renderOwnerMsgs();
    showFlash('Welcome, Godswill ✦');
  } else {
    setStatus('otpStatus', 'Incorrect code. Please check your Gmail and try again.', 'err');
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const o1 = document.getElementById('o1');
    if (o1) o1.focus();
  }
}

/* ── Back to email step ── */
function backToEmail() {
  document.getElementById('emailStep').style.display = 'block';
  document.getElementById('otpStep').style.display   = 'none';
  document.getElementById('emailStatus').innerHTML   = '';
  ['o1','o2','o3','o4','o5','o6'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

/* ── Lock dashboard ── */
function lockDash() {
  document.getElementById('loginStep').style.display  = 'block';
  document.getElementById('ownerDash').style.display  = 'none';
  document.getElementById('emailStep').style.display  = 'block';
  document.getElementById('otpStep').style.display    = 'none';

  const emailEl = document.getElementById('ownerEmail');
  if (emailEl) emailEl.value = '';
  document.getElementById('emailStatus').innerHTML = '';

  ['o1','o2','o3','o4','o5','o6'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  otpCode = '';
  showFlash('Dashboard locked securely ✦');
}
