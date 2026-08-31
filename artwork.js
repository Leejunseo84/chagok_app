/* ===========================================================
   artwork.js
   캐릭터/카테고리 건물/적금 금고/지갑을 매끈한 벡터(SVG)로 그리는
   유틸리티. 이전의 픽셀 그리드 캔버스 렌더링을 대체한다
   (부드러운 플랫 일러스트 스타일 - 동색 아웃라인 + 은은한 하이라이트).
=========================================================== */

/* ------------------- 색상 유틸 ------------------- */
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex([r, g, b]) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
}
function lighten(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex([r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt]);
}
function darken(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex([r * (1 - amt), g * (1 - amt), b * (1 - amt)]);
}
const OW = 2.2; // 아웃라인 두께 (부드러운 스타일)
const outlineOf = (base) => darken(base, 0.45);

function svgWrap(inner, natW, natH) {
  /* 부모가 height를 정하면 그 비율에 맞춰 width가 자동으로 정해진다
     (건물마다 가로세로 비율이 달라도 컨테이너 높이만 맞추면 됨) */
  return `<svg viewBox="0 0 ${natW} ${natH}" fill="none" xmlns="http://www.w3.org/2000/svg" style="height:100%; width:auto; display:block;">${inner}</svg>`;
}

/* ------------------- 캐릭터: 오리지널 동물 마스코트 (64 x 80) -------------------
   머리를 크게, 몸통/팔/다리는 머리에 딱 붙은 작은 덩어리로 그려 이음새 없는
   몽글몽글한 실루엣을 만든다. 눈코입은 얼굴 중앙 하단에 모으고 볼터치를 크게. */
const CHAR_NAT_W = 64, CHAR_NAT_H = 80;
const CHAR_OW = 2.6;
const charOutlineOf = (base) => darken(base, 0.5);

const HEAD_CX = 32, HEAD_CY = 30, HEAD_R = 21;
const BODY_CX = 32, BODY_CY = 57, BODY_RX = 16, BODY_RY = 14;

const AVATARS = [
  { id: "cat", label: "고양이", species: "cat" },
  { id: "bear", label: "곰", species: "bear" },
  { id: "dog", label: "강아지", species: "dog" },
  { id: "rabbit", label: "토끼", species: "rabbit" },
];

function _animalBase(fur, arms) {
  if (arms === undefined) arms = true;
  const o = charOutlineOf(fur);
  const p = [];
  p.push(`<ellipse cx="${BODY_CX}" cy="77" rx="16" ry="2.8" fill="rgba(40,32,20,0.14)"/>`);
  p.push(`<ellipse cx="24" cy="71" rx="6.4" ry="5.4" fill="${fur}" stroke="${o}" stroke-width="${CHAR_OW}"/>`);
  p.push(`<ellipse cx="40" cy="71" rx="6.4" ry="5.4" fill="${fur}" stroke="${o}" stroke-width="${CHAR_OW}"/>`);
  p.push(`<ellipse cx="${BODY_CX}" cy="${BODY_CY}" rx="${BODY_RX}" ry="${BODY_RY}" fill="${fur}" stroke="${o}" stroke-width="${CHAR_OW}"/>`);
  if (arms) {
    p.push(`<circle cx="17" cy="56" r="6.6" fill="${fur}" stroke="${o}" stroke-width="${CHAR_OW}"/>`);
    p.push(`<circle cx="47" cy="56" r="6.6" fill="${fur}" stroke="${o}" stroke-width="${CHAR_OW}"/>`);
  }
  p.push(`<ellipse cx="${BODY_CX}" cy="55" rx="8" ry="9" fill="${lighten(fur, 0.35)}" opacity="0.55"/>`);
  return p;
}

function _animalHead(p, fur) {
  const o = charOutlineOf(fur);
  p.push(`<circle cx="${HEAD_CX}" cy="${HEAD_CY}" r="${HEAD_R}" fill="${fur}" stroke="${o}" stroke-width="${CHAR_OW}"/>`);
}

function _animalBlush(p, color) {
  const c = color || "#f7b8b0";
  const r = 3.6;
  p.push(`<ellipse cx="19.5" cy="34" rx="${r}" ry="${r * 0.68}" fill="${c}" opacity="0.8"/>`);
  p.push(`<ellipse cx="44.5" cy="34" rx="${r}" ry="${r * 0.68}" fill="${c}" opacity="0.8"/>`);
}

function _animalEyes(p, cy, dx) {
  if (cy === undefined) cy = 29;
  if (dx === undefined) dx = 6.5;
  p.push(`<circle cx="${HEAD_CX - dx}" cy="${cy}" r="1.9" fill="#2a1d14"/>`);
  p.push(`<circle cx="${HEAD_CX + dx}" cy="${cy}" r="1.9" fill="#2a1d14"/>`);
}

function catSvg() {
  const fur = "#f7efe3", innerEar = "#f3b6c0", nose = "#e8879a";
  const o = charOutlineOf(fur);
  const p = _animalBase(fur);
  p.push(`<path d="M44 65 C 54 66, 60 58, 58 48 C 57 43, 52 41, 49 45 C 51 50, 49 57, 45 61 Z" fill="${fur}" stroke="${o}" stroke-width="${CHAR_OW}" stroke-linejoin="round"/>`);
  p.push(`<path d="M15 20 L19 6 L27 18 Z" fill="${fur}" stroke="${o}" stroke-width="${CHAR_OW}" stroke-linejoin="round"/>`);
  p.push(`<path d="M49 20 L45 6 L37 18 Z" fill="${fur}" stroke="${o}" stroke-width="${CHAR_OW}" stroke-linejoin="round"/>`);
  p.push(`<path d="M17.5 17 L19.5 9 L23.5 16.5 Z" fill="${innerEar}"/>`);
  p.push(`<path d="M46.5 17 L44.5 9 L40.5 16.5 Z" fill="${innerEar}"/>`);
  _animalHead(p, fur);
  _animalBlush(p);
  _animalEyes(p);
  [-2, 2].forEach((dy) => {
    p.push(`<path d="M6 ${32 + dy} L16 ${33 + dy * 0.3}" stroke="${o}" stroke-width="1" opacity="0.45" stroke-linecap="round"/>`);
    p.push(`<path d="M58 ${32 + dy} L48 ${33 + dy * 0.3}" stroke="${o}" stroke-width="1" opacity="0.45" stroke-linecap="round"/>`);
  });
  p.push(`<path d="M30.5 35 L33.5 35 L32 37 Z" fill="${nose}"/>`);
  p.push(`<path d="M32 37 Q29.5 39.5 27 38" stroke="#8a5a3a" stroke-width="1.4" fill="none" stroke-linecap="round"/>`);
  p.push(`<path d="M32 37 Q34.5 39.5 37 38" stroke="#8a5a3a" stroke-width="1.4" fill="none" stroke-linecap="round"/>`);
  return svgWrap(p.join(""), CHAR_NAT_W, CHAR_NAT_H);
}

function bearSvg() {
  const fur = "#b98159", snout = "#f0d3ac", nose = "#5a3a24";
  const o = charOutlineOf(fur);
  const p = _animalBase(fur);
  p.push(`<circle cx="15" cy="15" r="8.2" fill="${fur}" stroke="${o}" stroke-width="${CHAR_OW}"/>`);
  p.push(`<circle cx="49" cy="15" r="8.2" fill="${fur}" stroke="${o}" stroke-width="${CHAR_OW}"/>`);
  p.push(`<circle cx="15" cy="15" r="3.8" fill="${lighten(fur, 0.3)}"/>`);
  p.push(`<circle cx="49" cy="15" r="3.8" fill="${lighten(fur, 0.3)}"/>`);
  _animalHead(p, fur);
  _animalBlush(p, "#f0a888");
  p.push(`<ellipse cx="32" cy="35" rx="10" ry="8" fill="${snout}" stroke="${o}" stroke-width="1.8"/>`);
  _animalEyes(p, 28, 6.5);
  p.push(`<ellipse cx="32" cy="31.5" rx="2.8" ry="2.2" fill="${nose}"/>`);
  p.push(`<path d="M32 33.5 L32 36.5" stroke="${nose}" stroke-width="1.4"/>`);
  p.push(`<path d="M28.5 38 Q32 40.5 35.5 38" stroke="#7a4a2e" stroke-width="1.5" fill="none" stroke-linecap="round"/>`);
  return svgWrap(p.join(""), CHAR_NAT_W, CHAR_NAT_H);
}

function dogSvg() {
  const fur = "#eec27f", snout = "#fff6e6", nose = "#5a3a24";
  const o = charOutlineOf(fur);
  const p = _animalBase(fur);
  p.push(`<path d="M16 18 Q6 24 9 36 Q12 41 19 37 Q16 28 16 18 Z" fill="${fur}" stroke="${o}" stroke-width="${CHAR_OW}" stroke-linejoin="round"/>`);
  p.push(`<path d="M48 18 Q58 24 55 36 Q52 41 45 37 Q48 28 48 18 Z" fill="${fur}" stroke="${o}" stroke-width="${CHAR_OW}" stroke-linejoin="round"/>`);
  _animalHead(p, fur);
  _animalBlush(p);
  p.push(`<ellipse cx="32" cy="36" rx="9" ry="7" fill="${snout}" stroke="${o}" stroke-width="1.8"/>`);
  _animalEyes(p, 28, 6.5);
  p.push(`<ellipse cx="32" cy="33" rx="2.6" ry="2.1" fill="${nose}"/>`);
  p.push(`<path d="M32 35 L32 37.5" stroke="${nose}" stroke-width="1.4"/>`);
  p.push(`<path d="M28.5 39 Q32 41.2 35.5 39" stroke="#a97030" stroke-width="1.5" fill="none" stroke-linecap="round"/>`);
  return svgWrap(p.join(""), CHAR_NAT_W, CHAR_NAT_H);
}

function rabbitSvg() {
  const fur = "#fdfaf5", innerEar = "#f3b6c0", nose = "#e8879a";
  const o = charOutlineOf(fur);
  const p = _animalBase(fur);
  p.push(`<g transform="rotate(-8 20 20)"><rect x="14" y="-2" width="12" height="30" rx="6" fill="${fur}" stroke="${o}" stroke-width="${CHAR_OW}"/><rect x="17.2" y="3" width="5.6" height="19" rx="2.8" fill="${innerEar}"/></g>`);
  p.push(`<g transform="rotate(8 44 20)"><rect x="38" y="-2" width="12" height="30" rx="6" fill="${fur}" stroke="${o}" stroke-width="${CHAR_OW}"/><rect x="41.2" y="3" width="5.6" height="19" rx="2.8" fill="${innerEar}"/></g>`);
  _animalHead(p, fur);
  _animalBlush(p);
  _animalEyes(p);
  p.push(`<path d="M30.5 35 L33.5 35 L32 37 Z" fill="${nose}"/>`);
  p.push(`<path d="M32 37 L32 38.3" stroke="#8a5a3a" stroke-width="1.2"/>`);
  p.push(`<path d="M32 38.3 Q29.5 40.5 27.5 39" stroke="#8a5a3a" stroke-width="1.4" fill="none" stroke-linecap="round"/>`);
  p.push(`<path d="M32 38.3 Q34.5 40.5 36.5 39" stroke="#8a5a3a" stroke-width="1.4" fill="none" stroke-linecap="round"/>`);
  return svgWrap(p.join(""), CHAR_NAT_W, CHAR_NAT_H);
}

const SPECIES_SVG = { cat: catSvg, bear: bearSvg, dog: dogSvg, rabbit: rabbitSvg };

function charSvg(avatar) {
  const fn = SPECIES_SVG[avatar.species] || catSvg;
  return fn();
}

/* ------------------- 카테고리별 건물 ------------------- */

function bowlSvg(base) {
  const NAT_W = 88, NAT_H = 68;
  const outline = outlineOf(base);
  const rim = lighten(base, 0.55);
  const p = [];
  p.push(`<ellipse cx="44" cy="60" rx="26" ry="4" fill="rgba(40,32,20,0.14)"/>`);
  [[-10, 14], [0, 18], [10, 14]].forEach(([dx, dl]) => {
    const x = 44 + dx;
    p.push(`<path d="M${x} ${30 - dl} Q${x - 6} ${30 - dl * 0.5} ${x} ${30 - dl * 0.15} Q${x + 6} 29.8 ${x} 30" stroke="${lighten(base, 0.6)}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>`);
  });
  p.push(`<path d="M10 32 Q6 54 44 58 Q82 54 78 32 Z" fill="${base}" stroke="${outline}" stroke-width="${OW}" stroke-linejoin="round"/>`);
  p.push(`<ellipse cx="30" cy="42" rx="9" ry="13" fill="${lighten(base, 0.3)}" opacity="0.5"/>`);
  p.push(`<ellipse cx="44" cy="32" rx="34" ry="9" fill="${rim}" stroke="${outline}" stroke-width="${OW}"/>`);
  p.push(`<ellipse cx="44" cy="32" rx="26" ry="5.5" fill="${darken(base, 0.12)}"/>`);
  return svgWrap(p.join(""), NAT_W, NAT_H);
}

function taxiSvg(base) {
  const NAT_W = 104, NAT_H = 68;
  const outline = outlineOf(base);
  const cabin = lighten(base, 0.18);
  const p = [];
  p.push(`<ellipse cx="52" cy="62" rx="42" ry="4" fill="rgba(40,32,20,0.14)"/>`);
  p.push(`<rect x="6" y="30" width="92" height="24" rx="11" fill="${base}" stroke="${outline}" stroke-width="${OW}"/>`);
  p.push(`<path d="M26 30 Q30 10 52 10 Q74 10 78 30 Z" fill="${cabin}" stroke="${outline}" stroke-width="${OW}" stroke-linejoin="round"/>`);
  p.push(`<rect x="33" y="16" width="16" height="12" rx="3" fill="#eaf6ff" stroke="${outline}" stroke-width="2"/>`);
  p.push(`<rect x="55" y="16" width="16" height="12" rx="3" fill="#eaf6ff" stroke="${outline}" stroke-width="2"/>`);
  p.push(`<rect x="40" y="4" width="24" height="9" rx="3" fill="#ffe14a" stroke="${outline}" stroke-width="2"/>`);
  [28, 76].forEach((cx) => {
    p.push(`<circle cx="${cx}" cy="56" r="11" fill="#241f18" stroke="${outline}" stroke-width="2"/>`);
    p.push(`<circle cx="${cx}" cy="56" r="4.5" fill="#d8d8d8"/>`);
  });
  p.push(`<rect x="10" y="34" width="36" height="6" rx="3" fill="${lighten(base, 0.35)}" opacity="0.55"/>`);
  return svgWrap(p.join(""), NAT_W, NAT_H);
}

function trainSvg(base) {
  const NAT_W = 124, NAT_H = 68;
  const outline = outlineOf(base);
  const p = [];
  p.push(`<ellipse cx="62" cy="62" rx="54" ry="4" fill="rgba(40,32,20,0.14)"/>`);
  p.push(`<rect x="6" y="14" width="112" height="38" rx="16" fill="${base}" stroke="${outline}" stroke-width="${OW}"/>`);
  [34, 62, 90].forEach((cx) => {
    p.push(`<rect x="${cx - 11}" y="21" width="22" height="17" rx="5" fill="#eaf6ff" stroke="${outline}" stroke-width="2"/>`);
  });
  p.push(`<rect x="6" y="42" width="112" height="6" fill="${lighten(base, 0.4)}" opacity="0.7"/>`);
  p.push(`<circle cx="112" cy="24" r="4" fill="#ffe14a" stroke="${outline}" stroke-width="1.6"/>`);
  [26, 50, 74, 98].forEach((cx) => {
    p.push(`<circle cx="${cx}" cy="56" r="9" fill="#241f18" stroke="${outline}" stroke-width="2"/>`);
    p.push(`<circle cx="${cx}" cy="56" r="3.6" fill="#d8d8d8"/>`);
  });
  p.push(`<rect x="10" y="18" width="30" height="7" rx="3.5" fill="${lighten(base, 0.35)}" opacity="0.5"/>`);
  return svgWrap(p.join(""), NAT_W, NAT_H);
}

function bagSvg(base) {
  const NAT_W = 76, NAT_H = 80;
  const outline = outlineOf(base);
  const flap = lighten(base, 0.22);
  const p = [];
  p.push(`<ellipse cx="38" cy="76" rx="26" ry="3.6" fill="rgba(40,32,20,0.14)"/>`);
  p.push(`<path d="M20 24 Q20 4 38 4 Q56 4 56 24" stroke="${outline}" stroke-width="${OW}" fill="none" stroke-linecap="round"/>`);
  p.push(`<rect x="8" y="24" width="60" height="48" rx="11" fill="${base}" stroke="${outline}" stroke-width="${OW}"/>`);
  p.push(`<rect x="8" y="24" width="60" height="13" rx="6" fill="${flap}"/>`);
  p.push(`<rect x="27" y="42" width="22" height="20" rx="6" fill="#fff6df" stroke="${outline}" stroke-width="2"/>`);
  p.push(`<rect x="13" y="40" width="10" height="26" rx="5" fill="${lighten(base, 0.3)}" opacity="0.5"/>`);
  return svgWrap(p.join(""), NAT_W, NAT_H);
}

function giftboxSvg(base) {
  const NAT_W = 76, NAT_H = 72;
  const outline = outlineOf(base);
  const lid = lighten(base, 0.2);
  const ribbon = "#fff6df";
  const p = [];
  p.push(`<ellipse cx="38" cy="68" rx="28" ry="3.6" fill="rgba(40,32,20,0.14)"/>`);
  p.push(`<rect x="8" y="24" width="60" height="40" rx="9" fill="${base}" stroke="${outline}" stroke-width="${OW}"/>`);
  p.push(`<rect x="3" y="15" width="70" height="15" rx="6" fill="${lid}" stroke="${outline}" stroke-width="${OW}"/>`);
  p.push(`<rect x="32" y="8" width="8" height="56" fill="${ribbon}" stroke="${outline}" stroke-width="1.6"/>`);
  p.push(`<rect x="8" y="40" width="60" height="9" fill="${ribbon}" stroke="${outline}" stroke-width="1.6"/>`);
  p.push(`<path d="M38 15 C 26 15 22 2 34 4 C 30 8 34 12 38 15 Z" fill="${ribbon}" stroke="${outline}" stroke-width="1.6" stroke-linejoin="round"/>`);
  p.push(`<path d="M38 15 C 50 15 54 2 42 4 C 46 8 42 12 38 15 Z" fill="${ribbon}" stroke="${outline}" stroke-width="1.6" stroke-linejoin="round"/>`);
  p.push(`<rect x="12" y="44" width="12" height="16" rx="4" fill="${lighten(base, 0.3)}" opacity="0.45"/>`);
  return svgWrap(p.join(""), NAT_W, NAT_H);
}

const CATEGORY_BUILDERS = { food: bowlSvg, shopping: bagSvg, taxi: taxiSvg, travel: trainSvg, etc: giftboxSvg };

function categorySvg(shapeKey, baseColor) {
  return CATEGORY_BUILDERS[shapeKey](baseColor);
}

/* ------------------- 적금 금고: 동/은/금 ------------------- */

const VAULT_TIERS = {
  bronze: { body: "#a5673a", door: "#c78a56", dial: "#6b4020", outline: "#4a2f1a", sparkle: false },
  silver: { body: "#aab0b8", door: "#d6dbe0", dial: "#5a5f68", outline: "#3a3d42", sparkle: false },
  gold: { body: "#e6b84a", door: "#ffe28a", dial: "#7a5210", outline: "#5a3a10", sparkle: true },
};

function vaultTierForAmount(amount) {
  if (amount <= 1000000) return "bronze";
  if (amount <= 5000000) return "silver";
  return "gold";
}

function vaultSvg(tier) {
  const NAT_W = 92, NAT_H = 92;
  const t = VAULT_TIERS[tier];
  const ow = OW + (tier === "gold" ? 0.6 : 0);
  const outline = t.outline;
  const p = [];
  p.push(`<ellipse cx="46" cy="88" rx="30" ry="4" fill="rgba(40,32,20,0.16)"/>`);
  p.push(`<rect x="6" y="6" width="80" height="80" rx="18" fill="${t.body}" stroke="${outline}" stroke-width="${ow}"/>`);
  p.push(`<rect x="12" y="12" width="22" height="14" rx="6" fill="${lighten(t.body, 0.35)}" opacity="0.55"/>`);
  p.push(`<circle cx="46" cy="46" r="29" fill="${t.door}" stroke="${outline}" stroke-width="${ow}"/>`);
  p.push(`<circle cx="46" cy="46" r="15" fill="${t.dial}" stroke="${outline}" stroke-width="2.4"/>`);
  [0, 90, 180, 270].forEach((ang) => {
    const rad = (ang * Math.PI) / 180;
    const cx = (46 + 15 * Math.cos(rad)).toFixed(1);
    const cy = (46 + 15 * Math.sin(rad)).toFixed(1);
    p.push(`<circle cx="${cx}" cy="${cy}" r="2.6" fill="${t.door}"/>`);
  });
  p.push(`<rect x="72" y="42" width="10" height="8" rx="3" fill="${t.outline}"/>`);
  if (t.sparkle) {
    [[20, 20, 5], [70, 26, 3.4], [24, 68, 3.4]].forEach(([sx, sy, r]) => {
      p.push(
        `<path d="M${sx} ${sy - r} L${sx + r * 0.3} ${sy - r * 0.3} L${sx + r} ${sy} L${sx + r * 0.3} ${sy + r * 0.3} ` +
        `L${sx} ${sy + r} L${sx - r * 0.3} ${sy + r * 0.3} L${sx - r} ${sy} L${sx - r * 0.3} ${sy - r * 0.3} Z" fill="#fff6df"/>`
      );
    });
  }
  return svgWrap(p.join(""), NAT_W, NAT_H);
}

/* ------------------- 지갑 ------------------- */

function walletSvg(pulse) {
  const NAT_W = 52, NAT_H = 40;
  const outline = "#8a6a2a";
  const flap = pulse ? "#ffe9c2" : "#ffe9c2";
  const p = [];
  p.push(`<rect x="2" y="6" width="48" height="32" rx="9" fill="${pulse ? "#fff2d8" : "#fff6e0"}" stroke="${outline}" stroke-width="2.2"/>`);
  p.push(`<rect x="2" y="6" width="48" height="15" rx="9" fill="${flap}"/>`);
  p.push(`<circle cx="40" cy="22" r="5" fill="#caa25a" stroke="${outline}" stroke-width="1.8"/>`);
  return svgWrap(p.join(""), NAT_W, NAT_H);
}
