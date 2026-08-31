/* ===========================================================
   pixelart.js
   문자 그리드로 정의한 픽셀아트를 canvas에 그려주는 유틸리티.
   외부 이미지 파일 없이 코드만으로 캐릭터/건물/금고를 그린다
   (오프라인에서도 100% 동작).
=========================================================== */

/** 문자 그리드 + 색상 맵을 받아 canvas에 그린다 (도트 하나 = pixelSize px) */
function drawPixelGrid(ctx, grid, colorMap, pixelSize) {
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const code = row[x];
      if (code === " " || code === ".") continue;
      const color = colorMap[code];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
}

function sizeCanvasForGrid(canvas, grid, pixelSize) {
  canvas.width = grid[0].length * pixelSize;
  canvas.height = grid.length * pixelSize;
}

/* ------------------- 색상 유틸 (밝게/어둡게) ------------------- */

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

/* ------------------- 캐릭터 (10 x 12) ------------------- */
/* O=외곽선 H=머리 S=피부 C=상의 P=하의 */
const CHAR_GRID = [
  "  OOOOOO  ",
  " OHHHHHHO ",
  " OHSSSSHO ",
  " OSSSSSSO ",
  "  OSSSSO  ",
  " OCCCCCCO ",
  "OCCCCCCCCO",
  "OCCCCCCCCO",
  " OCCCCCCO ",
  "  OPPPPO  ",
  " OPP  PPO ",
  " OO    OO ",
];

const AVATARS = [
  { id: "a1", label: "밤톨이", hair: "#5b3a24", shirt: "#d1495b", pants: "#3a3a52" },
  { id: "a2", label: "초록이", hair: "#2f2f2f", shirt: "#4c9a63", pants: "#2b2b40" },
  { id: "a3", label: "하늘이", hair: "#7a4a2b", shirt: "#3d8fd6", pants: "#40342a" },
  { id: "a4", label: "노랑이", hair: "#3a2317", shirt: "#e8b93a", pants: "#3a3a52" },
  { id: "a5", label: "보라돌이", hair: "#241b17", shirt: "#8b5fbf", pants: "#2b2b40" },
  { id: "a6", label: "분홍이", hair: "#4a2f22", shirt: "#e58ab0", pants: "#3a3a52" },
];

function drawCharacter(canvas, avatar, pixelSize) {
  sizeCanvasForGrid(canvas, CHAR_GRID, pixelSize);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const colorMap = { O: "#2a1d14", H: avatar.hair, S: "#f0c39a", C: avatar.shirt, P: avatar.pants };
  drawPixelGrid(ctx, CHAR_GRID, colorMap, pixelSize);
}

/* ------------------- 카테고리별 건물 모양 -------------------
   식비=그릇, 쇼핑=쇼핑백, 택시=자동차, 여행=기차, 기타=선물상자
   각 모양은 뼈대(D/W/H/L/N/S/G/R)만 정해두고, 카테고리 대표색에서
   나머지 색(그림자/하이라이트)을 자동으로 파생시켜 칠한다.
------------------------------------------------------------- */

function blankGrid(cols, rows) {
  return Array.from({ length: rows }, () => Array(cols).fill(" "));
}
function gridToRows(g) {
  return g.map((r) => r.join(""));
}
function stamp(grid, bitmap, top, left) {
  for (let dy = 0; dy < bitmap.length; dy++) {
    for (let dx = 0; dx < bitmap[dy].length; dx++) {
      const ch = bitmap[dy][dx];
      if (ch === " ") continue;
      const y = top + dy, x = left + dx;
      if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) grid[y][x] = ch;
    }
  }
}

const WHEEL5 = [" EEE ", "ETTTE", "ETUTE", "ETTTE", " EEE "];

function makeBowlGrid() {
  const cols = 17, rows = 12;
  const g = blankGrid(cols, rows);
  const cx = Math.floor(cols / 2);
  g[0][cx - 4] = "m"; g[0][cx - 3] = "m"; g[1][cx - 4] = "m";
  g[0][cx + 2] = "m"; g[0][cx + 3] = "m"; g[1][cx + 3] = "m";

  const rimW = cols - 2;
  let l = Math.floor((cols - rimW) / 2), r = l + rimW - 1;
  for (let c = l; c <= r; c++) g[2][c] = "D";

  const bodyRows = 6;
  for (let i = 0; i < bodyRows; i++) {
    const rr = 3 + i;
    const w = Math.max(5, rimW - i * 2);
    const ll = cx - Math.floor(w / 2), right = ll + w - 1;
    for (let c = ll; c <= right; c++) {
      if (c === ll || c === right) g[rr][c] = "D";
      else g[rr][c] = i === 0 ? "H" : "W";
    }
  }
  g[3][cx - 2] = "N"; g[3][cx + 1] = "N"; g[4][cx] = "N";

  const baseR = 3 + bodyRows;
  const bw = 5;
  const ll = cx - Math.floor(bw / 2), right = ll + bw - 1;
  if (baseR < rows) for (let c = ll; c <= right; c++) g[baseR][c] = "D";
  return gridToRows(g);
}

function makeTaxiGrid() {
  const cols = 20, rows = 11;
  const g = blankGrid(cols, rows);
  const cabW = cols - 8;
  const cl = Math.floor((cols - cabW) / 2), cr = cl + cabW - 1;
  for (let r = 0; r < 4; r++) for (let c = cl; c <= cr; c++) g[r][c] = "W";
  for (let c = cl; c <= cr; c++) g[0][c] = "D";
  for (let r = 0; r < 4; r++) { g[r][cl] = "D"; g[r][cr] = "D"; }
  for (let c = cl + 2; c < cr - 1; c++) { g[1][c] = "N"; g[2][c] = "N"; }

  for (let r = 4; r < 8; r++) for (let c = 0; c < cols; c++) g[r][c] = "W";
  for (let c = 0; c < cols; c++) g[7][c] = "D";
  for (let r = 4; r < 8; r++) { g[r][0] = "D"; g[r][cols - 1] = "D"; }

  for (let c = 1; c < cols - 1; c++) g[6][c] = c % 2 === 0 ? "S" : "W";

  stamp(g, WHEEL5, 7, 3);
  stamp(g, WHEEL5, 7, cols - 8);
  return gridToRows(g);
}

function makeTrainGrid() {
  const cols = 24, rows = 12;
  const g = blankGrid(cols, rows);
  for (let r = 0; r < 3; r++) { g[r][3] = "D"; g[r][4] = "D"; }

  const bodyTop = 3, bodyBot = 8;
  for (let r = bodyTop; r <= bodyBot; r++) for (let c = 0; c < cols; c++) g[r][c] = "W";
  for (let c = 0; c < cols; c++) { g[bodyTop][c] = "D"; g[bodyBot][c] = "D"; }
  for (let r = bodyTop; r <= bodyBot; r++) { g[r][0] = "D"; g[r][cols - 1] = "D"; }
  g[bodyTop][cols - 1] = " ";
  g[bodyTop][cols - 2] = "D";
  g[bodyTop + 1][cols - 1] = "D";

  [6, 11, 16].forEach((wx) => {
    for (let c = wx; c < wx + 3; c++) { g[bodyTop + 1][c] = "N"; g[bodyTop + 2][c] = "N"; }
  });

  const stripeR = bodyBot - 1;
  for (let c = 1; c < cols - 1; c++) g[stripeR][c] = "S";
  g[bodyBot - 2][cols - 3] = "G";

  [4, 10, 17].forEach((wx) => stamp(g, WHEEL5, bodyBot, wx));
  return gridToRows(g);
}

function makeBagGrid() {
  const cols = 16, rows = 13;
  const g = blankGrid(cols, rows);
  g[0][4] = "D"; g[0][11] = "D";
  g[1][3] = "D"; g[1][4] = "D"; g[1][11] = "D"; g[1][12] = "D";

  for (let r = 3; r < 13; r++) for (let c = 0; c < cols; c++) g[r][c] = "W";
  for (let c = 0; c < cols; c++) { g[3][c] = "D"; g[12][c] = "D"; }
  for (let r = 3; r < 13; r++) { g[r][0] = "D"; g[r][cols - 1] = "D"; }
  for (let c = 1; c < cols - 1; c++) g[4][c] = "H";
  for (let r = 7; r < 10; r++) for (let c = 6; c < 10; c++) g[r][c] = "L";
  return gridToRows(g);
}

function makeGiftboxGrid() {
  const cols = 14, rows = 11;
  const g = blankGrid(cols, rows);
  for (let r = 1; r < 3; r++) for (let c = 0; c < cols; c++) g[r][c] = "H";
  for (let c = 0; c < cols; c++) g[1][c] = "D";
  for (let r = 1; r < 3; r++) { g[r][0] = "D"; g[r][cols - 1] = "D"; }

  for (let r = 3; r < 11; r++) for (let c = 0; c < cols; c++) g[r][c] = "W";
  for (let r = 3; r < 11; r++) { g[r][0] = "D"; g[r][cols - 1] = "D"; }
  for (let c = 0; c < cols; c++) g[10][c] = "D";

  const cx = Math.floor(cols / 2);
  for (let r = 0; r < 11; r++) { g[r][cx - 1] = "R"; g[r][cx] = "R"; }
  for (let c = 0; c < cols; c++) g[6][c] = "R";
  return gridToRows(g);
}

const CATEGORY_SHAPES = {
  food: makeBowlGrid,
  shopping: makeBagGrid,
  taxi: makeTaxiGrid,
  travel: makeTrainGrid,
  etc: makeGiftboxGrid,
};

function categoryPalette(baseHex, shapeKey) {
  const pal = {
    D: darken(baseHex, 0.62),
    W: baseHex,
    H: lighten(baseHex, 0.30),
    L: lighten(baseHex, 0.55),
    N: "#fff6df",
    m: "#e9ddc8",
    R: "#fff6df",
    T: "#242424",
    U: "#d8d8d8",
    E: "#2a241c",
  };
  if (shapeKey === "taxi" || shapeKey === "travel") {
    pal.S = shapeKey === "taxi" ? "#2a241c" : "#fff6df";
    pal.G = "#ffe14a";
  }
  return pal;
}

function drawCategoryShape(canvas, shapeKey, baseColor, pixelSize) {
  const grid = CATEGORY_SHAPES[shapeKey]();
  sizeCanvasForGrid(canvas, grid, pixelSize);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPixelGrid(ctx, grid, categoryPalette(baseColor, shapeKey), pixelSize);
}

/* ------------------- 적금 금고: 금액 구간별 동/은/금 ------------------- */

const VAULT_GRID = [
  "  OOOOOOOOOOOO  ",
  " OWWWWWWWWWWWWO ",
  "OWLLLLLLLLLLLLWO",
  "OWLWWWWWWWWWWLWO",
  "OWLWOOOOOOOOWLWO",
  "OWLWOGGGGGGOWLWO",
  "OWLWOGDDDDGGOWLW",
  "OWLWOGDOOODGOWLW",
  "OWLWOGDOOODGOWLW",
  "OWLWOGDDDDGGOWLW",
  "OWLWOGGGGGGOWLWO",
  "OWLWOOOOOOOOWLWO",
  "OWLWWWWWWWWWWLWO",
  "OWLLLLLLLLLLLLWO",
  " OWWWWWWWWWWWWO ",
  "  OOOOOOOOOOOO  ",
];

const VAULT_TIERS = {
  bronze: { O: "#4a2f1a", W: "#a5673a", L: "#c78a56", G: "#8a5a2e", D: "#6b4020" },
  silver: { O: "#3a3d42", W: "#aab0b8", L: "#d6dbe0", G: "#8a909a", D: "#5a5f68" },
  gold: { O: "#5a3a10", W: "#e6b84a", L: "#ffe28a", G: "#a37821", D: "#7a5210" },
};

function vaultTierForAmount(amount) {
  if (amount <= 1000000) return "bronze";
  if (amount <= 5000000) return "silver";
  return "gold";
}

function drawVault(canvas, pixelSize, fillRatio, amount) {
  const tier = vaultTierForAmount(amount || 0);
  const colorMap = VAULT_TIERS[tier];
  const meterW = 8, meterGap = 6;
  canvas.width = VAULT_GRID[0].length * pixelSize + meterGap + meterW;
  canvas.height = VAULT_GRID.length * pixelSize;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPixelGrid(ctx, VAULT_GRID, colorMap, pixelSize);

  // 목표 대비 채워짐 정도를 나타내는 미터 (오른쪽 세로 바)
  const meterX = VAULT_GRID[0].length * pixelSize + meterGap - 2;
  const meterH = VAULT_GRID.length * pixelSize;
  ctx.fillStyle = "#2a1d14";
  ctx.fillRect(meterX, 0, meterW, meterH);
  const fillH = Math.max(0, Math.min(1, fillRatio)) * (meterH - 4);
  ctx.fillStyle = "#caa25a";
  ctx.fillRect(meterX + 2, meterH - 2 - fillH, meterW - 4, fillH);

  return tier;
}

/* ------------------- 지갑 아이콘 ------------------- */
const WALLET_GRID = [
  "  OOOOOOOO  ",
  " OWWWWWWWWO ",
  "OWWWWWWWWWWO",
  "OWWOOOOOOWWO",
  "OWWOGGGGOWWO",
  "OWWOGDDGOWWO",
  "OWWOGGGGOWWO",
  "OWWWWWWWWWWO",
  " OWWWWWWWWO ",
  "  OOOOOOOO  ",
];
function drawWallet(canvas, pixelSize, pulse) {
  sizeCanvasForGrid(canvas, WALLET_GRID, pixelSize);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const colorMap = {
    O: "#8a6a2a",
    W: pulse ? "#ffe9c2" : "#fff6e0",
    G: "#caa25a",
    D: "#8a6a2a",
  };
  drawPixelGrid(ctx, WALLET_GRID, colorMap, pixelSize);
}
