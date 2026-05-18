/* ═══════════════════════════════════════════
   ENIGMA ALPHA — STYLES DATA
   Edit prices, names, descriptions here
═══════════════════════════════════════════ */

const DEFAULT_STYLES = [
  {
    id: 1, name: 'Classic Low Cut',
    desc: 'Clean, sharp low fade with precision razor lining.',
    price: 2500, duration: '30 min', cat: 'classic', icon: '✦', img: null
  },
  {
    id: 2, name: 'Skin Fade',
    desc: 'Seamless blend from skin to hair — the signature modern fade.',
    price: 3500, duration: '40 min', cat: 'modern', icon: '◈', img: null
  },
  {
    id: 3, name: 'Temp Fade + Design',
    desc: 'Tapered temples with a custom cut design of your choice.',
    price: 4500, duration: '50 min', cat: 'modern', icon: '✸', img: null
  },
  {
    id: 4, name: 'Afro Shape-up',
    desc: 'Defined edges and sculpted afro silhouette.',
    price: 2000, duration: '25 min', cat: 'classic', icon: '✿', img: null
  },
  {
    id: 5, name: 'Taper Fade',
    desc: 'Gradual taper that frames your face perfectly.',
    price: 3000, duration: '35 min', cat: 'classic', icon: '▲', img: null
  },
  {
    id: 6, name: 'Mid Fade + Waves',
    desc: '360 waves trained with a crisp mid fade.',
    price: 4000, duration: '45 min', cat: 'modern', icon: '〰', img: null
  },
  {
    id: 7, name: 'Full Beard Trim',
    desc: 'Professional shaping, lining and grooming of your beard.',
    price: 2500, duration: '30 min', cat: 'beard', icon: '♦', img: null
  },
  {
    id: 8, name: 'Beard + Line-up',
    desc: 'Edge-up haircut with matching beard shaping.',
    price: 4500, duration: '50 min', cat: 'beard', icon: '✂', img: null
  },
  {
    id: 9, name: 'Hot Towel Shave',
    desc: 'Luxury straight-razor shave with hot towel treatment.',
    price: 3500, duration: '35 min', cat: 'beard', icon: '◆', img: null
  },
  {
    id: 10, name: 'Kids Cut (0–10)',
    desc: 'Gentle, precise cut for your little ones.',
    price: 1500, duration: '25 min', cat: 'kids', icon: '★', img: null
  },
  {
    id: 11, name: 'Kids Fade',
    desc: 'Stylish fade for kids — fresh and confident.',
    price: 2000, duration: '30 min', cat: 'kids', icon: '✩', img: null
  },
  {
    id: 12, name: 'Haircut + Wash',
    desc: 'Premium haircut with relaxing wash and conditioning.',
    price: 5000, duration: '60 min', cat: 'modern', icon: '◇', img: null
  }
];

const STYLES_STORAGE_KEY = 'enigma_styles_v1';

/* Load from localStorage, fall back to defaults */
function loadStyles() {
  try {
    const saved = localStorage.getItem(STYLES_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_STYLES));
}

/* Save current styles to localStorage */
function saveStyles() {
  try {
    localStorage.setItem(STYLES_STORAGE_KEY, JSON.stringify(STYLES_DATA));
  } catch (e) {}
}

/* Live array — everything reads and writes this */
let STYLES_DATA = loadStyles();