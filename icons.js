/* ===========================================================
   icons.js
   이모지 대신 쓰는 아주 단순한 선 아이콘(SVG) 모음.
   기기/폰트에 따라 다르게 보이는 이모지 대신, 어디서든 똑같이
   보이도록 직접 그린 아이콘을 사용한다.
=========================================================== */

const ICON_PATHS = {
  chart: '<path d="M4 20V10M12 20V4M20 20v-7"/>',
  sliders: '<path d="M4 6h16M4 12h10M4 18h6"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="14" cy="18" r="2"/>',
  wallet: '<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M16 13h3"/><path d="M3 10h18"/>',
  receipt: '<path d="M5 3h14v18l-2-1.3L15 21l-2-1.3L11 21l-2-1.3L7 21l-2-1.3z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  bank: '<path d="M4 10l8-5 8 5"/><rect x="5" y="10" width="14" height="9"/><path d="M9 10v9M15 10v9"/>',
  bowl: '<path d="M4 12h16a8 6 0 0 1-16 0z"/><path d="M9 9c0-2 1-3 1-5M13 9c0-2 1-3 1-5"/>',
  bag: '<path d="M6 8h12l-1 12H7z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
  car: '<path d="M4 16V13l2-4h12l2 4v3"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/>',
  train: '<rect x="5" y="3" width="14" height="12" rx="3"/><path d="M5 10h14"/><path d="M9 6.5h2M13 6.5h2"/><circle cx="8.5" cy="18.5" r="1.4"/><circle cx="15.5" cy="18.5" r="1.4"/><path d="M8 15l-2.5 4M16 15l2.5 4"/>',
  box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5"/><path d="M5 19h14"/>',
  upload: '<path d="M12 20V9M7 13l5-5 5 5"/><path d="M5 19h14"/>',
};

function iconSvg(name, color, size, strokeWidth) {
  const s = size || 20;
  const sw = strokeWidth || 2;
  const d = ICON_PATHS[name] || "";
  return (
    `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" ` +
    `stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
  );
}

/** data-icon 속성이 붙은 요소를 찾아 이모지 대신 SVG 아이콘을 채워 넣는다 */
function applyDataIcons(root) {
  const scope = root || document;
  scope.querySelectorAll("[data-icon]").forEach((el) => {
    const name = el.dataset.icon;
    const color = el.dataset.iconColor || "currentColor";
    const size = Number(el.dataset.iconSize) || 20;
    const sw = Number(el.dataset.iconStroke) || 2;
    el.innerHTML = iconSvg(name, color, size, sw);
  });
}
