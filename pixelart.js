/* ===========================================================
   pixelart.js
   문자 그리드로 정의한 아주 단순한 픽셀아트를 canvas에 그려주는
   유틸리티. 외부 이미지 파일 없이 코드만으로 픽셀 캐릭터/건물을
   렌더링한다 (오프라인에서도 100% 동작).
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
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const colorMap = {
    O: "#2a1d14",
    H: avatar.hair,
    S: "#f0c39a",
    C: avatar.shirt,
    P: avatar.pants,
  };
  drawPixelGrid(ctx, CHAR_GRID, colorMap, pixelSize);
}

/* ------------------- 집 모양 건물 (14 x 14) ------------------- */
/* R=지붕 D=지붕테두리 W=벽 F=벽테두리 K=문 */
function buildHouseGrid() {
  return [
    "      DD      ",
    "     DRRD     ",
    "    DRRRRD    ",
    "   DRRRRRRD   ",
    "  DRRRRRRRRD  ",
    " DRRRRRRRRRRD ",
    "FFFFFFFFFFFFFF",
    "FWWWWWWWWWWWWF",
    "FWWWWWWWWWWWWF",
    "FWWWWWWWWWWWWF",
    "FWWWWKKKWWWWWF",
    "FWWWWKKKWWWWWF",
    "FWWWWKKKWWWWWF",
    "FFFFFFFFFFFFFF",
  ];
}

function drawHouse(canvas, roofColor, wallColor, pixelSize) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const colorMap = {
    D: "#2a1d14",
    R: roofColor,
    F: "#2a1d14",
    W: wallColor,
    K: "#402a1c",
  };
  drawPixelGrid(ctx, buildHouseGrid(), colorMap, pixelSize);
}

/* ------------------- 금고 (적금 건물, 16 x 16) ------------------- */
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
function drawVault(canvas, pixelSize, fillRatio) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const colorMap = {
    O: "#2a1d14",
    W: "#8a8f98",
    L: "#aab0b8",
    G: "#e6b84a",
    D: "#a37821",
  };
  drawPixelGrid(ctx, VAULT_GRID, colorMap, pixelSize);

  // 채워짐 정도를 나타내는 미터 (오른쪽에 세로 바)
  const meterX = VAULT_GRID[0].length * pixelSize + 6;
  const meterH = VAULT_GRID.length * pixelSize;
  const meterW = 8;
  ctx.fillStyle = "#2a1d14";
  ctx.fillRect(meterX, 0, meterW, meterH);
  const fillH = Math.max(0, Math.min(1, fillRatio)) * (meterH - 4);
  ctx.fillStyle = "#e6b84a";
  ctx.fillRect(meterX + 2, meterH - 2 - fillH, meterW - 4, fillH);
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
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const colorMap = {
    O: "#2a1d14",
    W: pulse ? "#a56a3a" : "#8a5a34",
    G: "#e6b84a",
    D: "#a37821",
  };
  drawPixelGrid(ctx, WALLET_GRID, colorMap, pixelSize);
}
