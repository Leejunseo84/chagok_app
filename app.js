/* ===========================================================
   차곡 - app.js
   전부 클라이언트(브라우저) 안에서만 동작. 서버 없음.
   데이터는 localStorage에 저장되어 인터넷 없이도 그대로 유지됨.
=========================================================== */

const STORAGE_KEY = "chagok_state_v1";

const CATEGORIES = [
  { key: "food", label: "식비", shape: "food", icon: "bowl", color: "#c9704a" },
  { key: "shopping", label: "쇼핑", shape: "shopping", icon: "bag", color: "#8a5a9a" },
  { key: "taxi", label: "택시", shape: "taxi", icon: "car", color: "#a8862c" },
  { key: "travel", label: "여행", shape: "travel", icon: "train", color: "#3f7ea3" },
  { key: "etc", label: "기타", shape: "etc", icon: "box", color: "#7a7d84" },
];

const POSITIONS = {
  food: { left: 14, top: 64 },
  shopping: { left: 28, top: 26 },
  taxi: { left: 52, top: 16 },
  travel: { left: 76, top: 30 },
  etc: { left: 89, top: 66 },
  vault: { left: 50, top: 82 },
  homeLeft: { left: 40, top: 52 },
  homeRight: { left: 58, top: 52 },
};

const $ = (sel) => document.querySelector(sel);
const $all = (sel) => Array.from(document.querySelectorAll(sel));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const todayStr = () => new Date().toISOString().slice(0, 10);
const formatWon = (n) => Math.round(n).toLocaleString("ko-KR") + "원";

/* ------------------- 상태 저장/로드 ------------------- */

function defaultState() {
  return {
    onboarded: false,
    characters: { me: null, partner: null },
    savingsGoal: 0,
    transactions: [], // {id,type,category?,amount,memo,date,who,createdAt}
  };
}

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed);
  } catch (e) {
    console.warn("state load failed, starting fresh", e);
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ------------------- 온보딩 ------------------- */

let selectedAvatarMe = null;
let selectedAvatarPartner = null;

function renderAvatarGrid(containerId, onPick) {
  const el = $(containerId);
  el.innerHTML = "";
  AVATARS.forEach((av) => {
    const opt = document.createElement("div");
    opt.className = "avatar-option";
    opt.dataset.id = av.id;
    const art = document.createElement("div");
    art.className = "avatar-art";
    art.innerHTML = charSvg(av);
    opt.appendChild(art);
    const label = document.createElement("div");
    label.textContent = av.label;
    opt.appendChild(label);
    opt.addEventListener("click", () => {
      $all(`${containerId} .avatar-option`).forEach((n) => n.classList.remove("selected"));
      opt.classList.add("selected");
      onPick(av.id);
    });
    el.appendChild(opt);
  });
}

function initOnboarding() {
  renderAvatarGrid("#avatar-grid-me", (id) => (selectedAvatarMe = id));
  renderAvatarGrid("#avatar-grid-partner", (id) => (selectedAvatarPartner = id));

  $("#btn-onb-next").addEventListener("click", () => {
    const name = $("#input-name-me").value.trim();
    if (!selectedAvatarMe || !name) {
      showToast("캐릭터랑 이름을 먼저 정해줘!");
      return;
    }
    $("#onb-step-me").classList.add("hidden");
    $("#onb-step-partner").classList.remove("hidden");
  });

  $("#btn-onb-start").addEventListener("click", () => {
    const nameMe = $("#input-name-me").value.trim();
    const namePartner = $("#input-name-partner").value.trim();
    if (!selectedAvatarPartner || !namePartner) {
      showToast("캐릭터랑 이름을 먼저 정해줘!");
      return;
    }
    state.characters.me = { id: "me", name: nameMe, avatarId: selectedAvatarMe };
    state.characters.partner = { id: "partner", name: namePartner, avatarId: selectedAvatarPartner };
    state.onboarded = true;
    saveState();
    showTown();
  });
}

function getAvatar(avatarId) {
  return AVATARS.find((a) => a.id === avatarId) || AVATARS[0];
}

/* ------------------- 화면 전환 ------------------- */

function showScreen(id) {
  $all(".screen").forEach((s) => s.classList.add("hidden"));
  $(id).classList.remove("hidden");
}

function showTown() {
  showScreen("#screen-town");
  buildTownIfNeeded();
  renderWallet();
  renderBuildings();
}

/* ------------------- 마을 화면 ------------------- */

let charMeEl, charPartnerEl;
let townBuilt = false;

function buildTownIfNeeded() {
  if (townBuilt) return;
  townBuilt = true;

  const buildingsLayer = $("#buildings-layer");
  CATEGORIES.forEach((cat) => {
    const pos = POSITIONS[cat.key];
    const slot = document.createElement("div");
    slot.className = "building-slot";
    slot.dataset.key = cat.key;
    slot.style.left = pos.left + "%";
    slot.style.top = pos.top + "%";
    const art = document.createElement("div");
    art.className = "building-art";
    art.innerHTML = categorySvg(cat.shape, cat.color);
    slot.appendChild(art);
    const tag = document.createElement("div");
    tag.className = "building-tag";
    tag.innerHTML = `<span data-icon="${cat.icon}" data-icon-color="${cat.color}" data-icon-size="13" data-icon-stroke="2"></span>${cat.label} <span class="tag-amount" data-amount="${cat.key}">0원</span>`;
    slot.appendChild(tag);
    buildingsLayer.appendChild(slot);
  });
  applyDataIcons(buildingsLayer);

  // 적금 금고
  const vaultPos = POSITIONS.vault;
  const vaultSlot = document.createElement("div");
  vaultSlot.className = "building-slot";
  vaultSlot.dataset.key = "vault";
  vaultSlot.style.left = vaultPos.left + "%";
  vaultSlot.style.top = vaultPos.top + "%";
  const vaultVisual = document.createElement("div");
  vaultVisual.className = "vault-visual";
  const vaultArt = document.createElement("div");
  vaultArt.className = "building-art vault-art";
  vaultArt.innerHTML = vaultSvg(vaultTierForAmount(0));
  const vaultMeter = document.createElement("div");
  vaultMeter.className = "vault-meter";
  vaultMeter.innerHTML = '<div class="vault-meter-fill"></div>';
  vaultVisual.appendChild(vaultArt);
  vaultVisual.appendChild(vaultMeter);
  vaultSlot.appendChild(vaultVisual);
  const vaultTag = document.createElement("div");
  vaultTag.className = "building-tag";
  vaultTag.innerHTML = `<span data-icon="bank" data-icon-color="#a8862c" data-icon-size="13" data-icon-stroke="2"></span>적금 <span class="tag-amount" data-amount="vault">0원</span>`;
  vaultSlot.appendChild(vaultTag);
  buildingsLayer.appendChild(vaultSlot);
  applyDataIcons(vaultSlot);

  // 캐릭터 2명 (나 / 상대방)
  charMeEl = createCharacterEl(state.characters.me, POSITIONS.homeLeft);
  charPartnerEl = createCharacterEl(state.characters.partner, POSITIONS.homeRight);
  $("#char-layer").appendChild(charMeEl);
  $("#char-layer").appendChild(charPartnerEl);

  // 지갑 아이콘 최초 렌더
  $("#wallet-canvas").innerHTML = walletSvg(false);
}

function createCharacterEl(character, pos) {
  const el = document.createElement("div");
  el.className = "character";
  el.style.left = pos.left + "%";
  el.style.top = pos.top + "%";
  const art = document.createElement("div");
  art.className = "character-art";
  art.innerHTML = charSvg(getAvatar(character.avatarId));
  el.appendChild(art);
  const nameTag = document.createElement("div");
  nameTag.className = "character-name";
  nameTag.textContent = character.name;
  el.appendChild(nameTag);
  return el;
}

function renderBuildings() {
  const totals = computeMonthTotals();
  CATEGORIES.forEach((cat) => {
    const amt = totals.byCategory[cat.key] || 0;
    const tagEl = document.querySelector(`.tag-amount[data-amount="${cat.key}"]`);
    if (tagEl) tagEl.textContent = formatWon(amt);
  });
  const vaultTotal = computeVaultTotal();
  const vaultTag = document.querySelector('.tag-amount[data-amount="vault"]');
  if (vaultTag) vaultTag.textContent = formatWon(vaultTotal);
  const vaultArt = document.querySelector('.building-slot[data-key="vault"] .vault-art');
  if (vaultArt) vaultArt.innerHTML = vaultSvg(vaultTierForAmount(vaultTotal));
  const vaultFill = document.querySelector('.building-slot[data-key="vault"] .vault-meter-fill');
  if (vaultFill) {
    const ratio = state.savingsGoal > 0 ? vaultTotal / state.savingsGoal : 0;
    vaultFill.style.height = Math.max(0, Math.min(1, ratio)) * 100 + "%";
  }
}

function renderWallet() {
  const balance = computeBalance();
  $("#wallet-amount").textContent = formatWon(balance);
}

function computeBalance() {
  let bal = 0;
  for (const tx of state.transactions) {
    if (tx.type === "income") bal += tx.amount;
    else bal -= tx.amount;
  }
  return bal;
}

function computeVaultTotal() {
  return state.transactions.filter((t) => t.type === "saving").reduce((s, t) => s + t.amount, 0);
}

function computeMonthTotals() {
  const ym = todayStr().slice(0, 7);
  const byCategory = {};
  let income = 0, expense = 0, saving = 0;
  for (const tx of state.transactions) {
    if (!tx.date || tx.date.slice(0, 7) !== ym) continue;
    if (tx.type === "expense") {
      byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount;
      expense += tx.amount;
    } else if (tx.type === "income") {
      income += tx.amount;
    } else if (tx.type === "saving") {
      saving += tx.amount;
    }
  }
  return { byCategory, income, expense, saving };
}

/* ------------------- 애니메이션 ------------------- */

function walkTo(el, pos, duration = 900) {
  return new Promise((resolve) => {
    el.classList.add("walking");
    el.style.left = pos.left + "%";
    el.style.top = pos.top + "%";
    setTimeout(() => {
      el.classList.remove("walking");
      resolve();
    }, duration);
  });
}

function bumpBuilding(key) {
  const slot = document.querySelector(`.building-slot[data-key="${key}"]`);
  if (!slot) return;
  slot.classList.remove("bump");
  void slot.offsetWidth; // reflow to restart animation
  slot.classList.add("bump");
  setTimeout(() => slot.classList.remove("bump"), 450);
}

function spawnFx(pos, text, emoji) {
  const layer = $("#fx-layer");
  const anchor = document.createElement("div");
  anchor.style.position = "absolute";
  anchor.style.left = pos.left + "%";
  anchor.style.top = (pos.top - 8) + "%";
  anchor.style.transform = "translate(-50%, -100%)";
  layer.appendChild(anchor);

  const coin = document.createElement("div");
  coin.className = "coin-fx";
  coin.textContent = emoji;
  coin.style.setProperty("--dx", "0px");
  coin.style.setProperty("--dy", "30px");
  anchor.appendChild(coin);

  const label = document.createElement("div");
  label.className = "float-text";
  label.textContent = text;
  anchor.appendChild(label);

  setTimeout(() => anchor.remove(), 1100);
}

function pulseWallet() {
  const chip = $("#wallet-chip");
  chip.classList.remove("pulse");
  void chip.offsetWidth;
  chip.classList.add("pulse");
  $("#wallet-canvas").innerHTML = walletSvg(true);
  setTimeout(() => { $("#wallet-canvas").innerHTML = walletSvg(false); }, 500);
}

async function playExpenseAnimation(who, categoryKey, amount) {
  const charEl = who === "me" ? charMeEl : charPartnerEl;
  const homePos = who === "me" ? POSITIONS.homeLeft : POSITIONS.homeRight;
  const target = POSITIONS[categoryKey];
  await walkTo(charEl, target);
  bumpBuilding(categoryKey);
  spawnFx(target, "-" + formatWon(amount), "🪙");
  renderBuildings();
  await sleep(650);
  await walkTo(charEl, homePos);
}

async function playSavingAnimation(who, amount) {
  const charEl = who === "me" ? charMeEl : charPartnerEl;
  const homePos = who === "me" ? POSITIONS.homeLeft : POSITIONS.homeRight;
  const target = POSITIONS.vault;
  await walkTo(charEl, target);
  bumpBuilding("vault");
  spawnFx(target, "+" + formatWon(amount), "💰");
  renderBuildings();
  await sleep(650);
  await walkTo(charEl, homePos);
}

/* ------------------- 입력 모달 ------------------- */

let modalType = "expense"; // 'income' | 'expense' | 'saving'
let selectedWho = "me";
let selectedCategory = null;

function openModal(type) {
  $("#toast").classList.add("hidden");
  clearTimeout(toastTimer);

  modalType = type;
  selectedWho = "me";
  selectedCategory = null;

  const titleMap = { income: "수입 추가", expense: "지출 추가", saving: "적금 넣기" };
  $("#modal-title").textContent = titleMap[type];
  $("#category-field").classList.toggle("hidden", type !== "expense");
  $("#input-amount").value = "";
  $("#input-memo").value = "";
  $("#input-date").value = todayStr();

  renderWhoRow();
  if (type === "expense") renderCategoryRow();

  $("#modal-backdrop").classList.remove("hidden");
}

function closeModal() {
  $("#modal-backdrop").classList.add("hidden");
}

function renderWhoRow() {
  const row = $("#who-row");
  row.innerHTML = "";
  ["me", "partner"].forEach((who) => {
    const c = state.characters[who];
    const chip = document.createElement("div");
    chip.className = "chip-btn" + (who === selectedWho ? " selected" : "");
    chip.textContent = c.name;
    chip.addEventListener("click", () => {
      selectedWho = who;
      renderWhoRow();
    });
    row.appendChild(chip);
  });
}

function renderCategoryRow() {
  const row = $("#category-row");
  row.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const chip = document.createElement("div");
    chip.className = "chip-btn" + (cat.key === selectedCategory ? " selected" : "");
    const color = cat.key === selectedCategory ? "#8a6a2a" : cat.color;
    chip.innerHTML = `<span data-icon="${cat.icon}" data-icon-color="${color}" data-icon-size="14" data-icon-stroke="2"></span>${cat.label}`;
    chip.addEventListener("click", () => {
      selectedCategory = cat.key;
      renderCategoryRow();
    });
    row.appendChild(chip);
  });
  applyDataIcons(row);
}

async function confirmAdd() {
  const amount = Number($("#input-amount").value);
  const date = $("#input-date").value || todayStr();
  const memo = $("#input-memo").value.trim();

  if (!amount || amount <= 0) {
    showToast("금액을 입력해줘!");
    return;
  }
  if (modalType === "expense" && !selectedCategory) {
    showToast("어디에 썼는지 골라줘!");
    return;
  }

  const tx = {
    id: uid(),
    type: modalType,
    category: modalType === "expense" ? selectedCategory : undefined,
    amount,
    memo,
    date,
    who: selectedWho,
    createdAt: new Date().toISOString(),
  };
  state.transactions.push(tx);
  saveState();
  closeModal();
  renderWallet();

  if (modalType === "income") {
    pulseWallet();
    showToast(`${state.characters[selectedWho].name}이(가) ${formatWon(amount)} 벌어왔어요!`);
  } else if (modalType === "expense") {
    await playExpenseAnimation(selectedWho, selectedCategory, amount);
    renderWallet();
  } else if (modalType === "saving") {
    await playSavingAnimation(selectedWho, amount);
    renderWallet();
    checkGoalReached();
  }
}

function checkGoalReached() {
  const total = computeVaultTotal();
  if (state.savingsGoal > 0 && total >= state.savingsGoal && !state._goalCelebrated) {
    state._goalCelebrated = true;
    saveState();
    showToast("🎉 적금 목표를 달성했어요!!");
  }
}

/* ------------------- 통계 화면 ------------------- */

function renderHistory() {
  const totals = computeMonthTotals();
  const balance = computeBalance();

  $("#stat-summary").innerHTML = `
    <div class="summary-row"><span>이번 달 수입</span><b>${formatWon(totals.income)}</b></div>
    <div class="summary-row"><span>이번 달 지출</span><b>${formatWon(totals.expense)}</b></div>
    <div class="summary-row"><span>이번 달 적금</span><b>${formatWon(totals.saving)}</b></div>
    <div class="summary-row"><span>현재 잔액</span><b>${formatWon(balance)}</b></div>
  `;

  const maxCat = Math.max(1, ...CATEGORIES.map((c) => totals.byCategory[c.key] || 0));
  $("#category-bars").innerHTML = CATEGORIES.map((c) => {
    const amt = totals.byCategory[c.key] || 0;
    const pct = Math.round((amt / maxCat) * 100);
    return `
      <div class="bar-row">
        <div class="bar-row-top"><span><span data-icon="${c.icon}" data-icon-color="${c.color}" data-icon-size="14" data-icon-stroke="2"></span>${c.label}</span><span>${formatWon(amt)}</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${c.color}"></div></div>
      </div>`;
  }).join("");
  applyDataIcons($("#category-bars"));

  const vaultTotal = computeVaultTotal();
  const goal = state.savingsGoal || 0;
  const ratio = goal > 0 ? Math.min(1, vaultTotal / goal) : 0;
  $("#saving-progress").innerHTML = `
    <div class="progress-track"><div class="progress-fill" style="width:${ratio * 100}%"></div></div>
    <div class="progress-label">${formatWon(vaultTotal)} / ${goal > 0 ? formatWon(goal) : "목표 미설정"}</div>
  `;

  const recent = [...state.transactions]
    .sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt))
    .slice(0, 25);
  $("#tx-list").innerHTML = recent.length
    ? recent.map((tx) => {
        const who = state.characters[tx.who]?.name || tx.who;
        const catLabel = tx.type === "expense" ? (CATEGORIES.find((c) => c.key === tx.category)?.label || "") : "";
        const typeLabel = tx.type === "income" ? "수입" : tx.type === "saving" ? "적금" : "지출";
        const sign = tx.type === "income" ? "+" : "-";
        return `<div class="tx-item">
          <span>${tx.date} · ${who} · ${typeLabel}${catLabel ? " " + catLabel : ""}${tx.memo ? " · " + escapeHtml(tx.memo) : ""}</span>
          <span class="tx-amount ${tx.type}">${sign}${formatWon(tx.amount)}</span>
        </div>`;
      }).join("")
    : `<div class="hint-text">아직 기록이 없어요.</div>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ------------------- 설정 화면 ------------------- */

function renderSettings() {
  $("#input-goal").value = state.savingsGoal || "";
  $("#import-result").textContent = "";
}

function saveGoal() {
  const v = Number($("#input-goal").value) || 0;
  state.savingsGoal = v;
  state._goalCelebrated = false;
  saveState();
  showToast("목표 금액을 저장했어요!");
  renderBuildings();
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = todayStr().replace(/-/g, "");
  a.href = url;
  a.download = `chagok-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("파일로 저장했어요. 카톡 등으로 보내주세요!");
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const incoming = JSON.parse(reader.result);
      let added = 0;
      const existingIds = new Set(state.transactions.map((t) => t.id));
      if (Array.isArray(incoming.transactions)) {
        for (const tx of incoming.transactions) {
          if (tx && tx.id && !existingIds.has(tx.id)) {
            state.transactions.push(tx);
            existingIds.add(tx.id);
            added++;
          }
        }
      }
      // 상대방 캐릭터 이름 정보가 비어있다면 채워준다 (덮어쓰지는 않음)
      if (!state.characters.partner && incoming.characters?.partner) {
        state.characters.partner = incoming.characters.partner;
      }
      saveState();
      renderWallet();
      renderBuildings();
      renderHistory();
      $("#import-result").textContent = `새 기록 ${added}건을 합쳤어요.`;
      showToast(`새 기록 ${added}건 합침!`);
    } catch (e) {
      $("#import-result").textContent = "파일을 읽을 수 없어요. 올바른 백업 파일인지 확인해주세요.";
    }
  };
  reader.readAsText(file);
}

function resetAll() {
  if (!confirm("정말 모든 기록을 지울까요? 이 작업은 되돌릴 수 없어요.")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  location.reload();
}

/* ------------------- 토스트 ------------------- */

let toastTimer = null;
function showToast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 2200);
}

/* ------------------- 이벤트 바인딩 ------------------- */

function bindEvents() {
  $all(".action-btn").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.dataset.action));
  });
  $("#btn-modal-close").addEventListener("click", closeModal);
  $("#modal-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop") closeModal();
  });
  $("#btn-confirm-add").addEventListener("click", confirmAdd);

  $("#btn-open-history").addEventListener("click", () => {
    renderHistory();
    showScreen("#screen-history");
  });
  $("#btn-history-back").addEventListener("click", () => showTown());

  $("#btn-open-settings").addEventListener("click", () => {
    renderSettings();
    showScreen("#screen-settings");
  });
  $("#btn-settings-back").addEventListener("click", () => showTown());

  $("#btn-save-goal").addEventListener("click", saveGoal);
  $("#btn-export").addEventListener("click", exportData);
  $("#input-import").addEventListener("change", (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = "";
  });
  $("#btn-reset").addEventListener("click", resetAll);
}

/* ------------------- 초기화 ------------------- */

function init() {
  applyDataIcons(document);
  bindEvents();
  if (state.onboarded && state.characters.me && state.characters.partner) {
    showTown();
  } else {
    initOnboarding();
    showScreen("#screen-onboarding");
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", init);
