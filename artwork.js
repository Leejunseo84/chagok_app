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

/* ------------------- 캐릭터 (64 x 80) ------------------- */
const CHAR_NAT_W = 64, CHAR_NAT_H = 80;

const AVATARS = [
  { id: "a1", label: "밤톨이", hair: "#5b3a24", shirt: "#d1495b", pants: "#3a3a52" },
  { id: "a2", label: "초록이", hair: "#2f2f2f", shirt: "#4c9a63", pants: "#2b2b40" },
  { id: "a3", label: "하늘이", hair: "#7a4a2b", shirt: "#3d8fd6", pants: "#40342a" },
  { id: "a4", label: "노랑이", hair: "#3a2317", shirt: "#e8b93a", pants: "#3a3a52" },
  { id: "a5", label: "보라돌이", hair: "#241b17", shirt: "#8b5fbf", pants: "#2b2b40" },
  { id: "a6", label: "분홍이", hair: "#4a2f22", shirt: "#e58ab0", pants: "#3a3a52" },
];
const CHAR_SKIN = "#f0c39a";

function charSvg(avatar) {
  const { hair, shirt, pants } = avatar;
  const skin = CHAR_SKIN;
  const hairO = outlineOf(hair), skinO = outlineOf(skin), shirtO = outlineOf(shirt), pantsO = outlineOf(pants);
  const p = [];
  p.push(`<ellipse cx="32" cy="76" rx="18" ry="3.4" fill="rgba(40,32,20,0.15)"/>`);
  p.push(`<rect x="18" y="60" width="10" height="14" rx="5" fill="${pants}" stroke="${pantsO}" stroke-width="${OW}"/>`);
  p.push(`<rect x="36" y="60" width="10" height="14" rx="5" fill="${pants}" stroke="${pantsO}" stroke-width="${OW}"/>`);
  p.push(`<circle cx="12" cy="46" r="7" fill="${shirt}" stroke="${shirtO}" stroke-width="${OW}"/>`);
  p.push(`<circle cx="52" cy="46" r="7" fill="${shirt}" stroke="${shirtO}" stroke-width="${OW}"/>`);
  p.push(`<rect x="14" y="34" width="36" height="30" rx="15" fill="${shirt}" stroke="${shirtO}" stroke-width="${OW}"/>`);
  p.push(`<ellipse cx="24" cy="42" rx="6" ry="9" fill="${lighten(shirt, 0.28)}" opacity="0.55"/>`);
  p.push(`<ellipse cx="32" cy="20" rx="19" ry="16" fill="${hair}" stroke="${hairO}" stroke-width="${OW}"/>`);
  p.push(`<circle cx="32" cy="26" r="15" fill="${skin}" stroke="${skinO}" stroke-width="${OW}"/>`);
  p.push(`<ellipse cx="26" cy="21" rx="4.5" ry="3.2" fill="${lighten(skin, 0.35)}" opacity="0.6"/>`);
  p.push(`<path d="M17 22 Q20 10 32 9 Q44 10 47 22 Q40 15 32 15 Q24 15 17 22 Z" fill="${hair}" stroke="${hairO}" stroke-width="${OW}" stroke-linejoin="round"/>`);
  p.push(`<circle cx="26.5" cy="27" r="1.8" fill="#2a1d14"/>`);
  p.push(`<circle cx="37.5" cy="27" r="1.8" fill="#2a1d14"/>`);
  p.push(`<path d="M27 33 Q32 36 37 33" stroke="#8a5a3a" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);
  return svgWrap(p.join(""), CHAR_NAT_W, CHAR_NAT_H);
}

function getAvatar(id) {
  return AVATARS.find((a) => a.id === id) || AVATARS[0];
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
