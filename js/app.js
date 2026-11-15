const DEFAULT_PARTICIPANTS = [
  'NGUYỄN THỊ THÚY',
  'LÊ HOÀNG PHI PHỤNG',
  'PHAN THÀNH ĐẠT',
  'MÃ THỊ CẨM TÚ',
  'THẠCH THỊ THẢO NGUYÊN',
  'VĂN VĂN LÊ',
  'QUÁCH THỊ MỘNG NGHI',
  'NGUYỄN THỊ THIÊN ÂN',
  'PHẠM THỊ THỦY'
];

const DEFAULT_PRIZES = [
  {
    id: 'special',
    icon: '📱',
    name: 'Giải đặc biệt',
    gift: 'iPhone 15 Pro Max 256GB',
    value: 'Trị giá: 34.990.000 VNĐ',
    total: 1,
    remaining: 1
  },
  {
    id: 'first',
    icon: '🥇',
    name: 'Giải nhất',
    gift: 'Đồng tiền vàng trị giá 10.000.000Đ',
    value: 'Trị giá: 10.000.000 VNĐ',
    total: 9,
    remaining: 9
  },
  {
    id: 'second',
    icon: '🥈',
    name: 'Giải nhì',
    gift: 'Máy lọc không khí PANASONIC',
    value: 'Trị giá: 5.500.000 VNĐ',
    total: 10,
    remaining: 10
  }
];

const STORAGE_KEY = 'lucky_wheel_bzt_state_v1';

let state = {
  participants: [...DEFAULT_PARTICIPANTS],
  prizes: JSON.parse(JSON.stringify(DEFAULT_PRIZES)),
  selectedPrizeId: 'first',
  results: [
    {
      name: 'TRẦM THẠCH VŨ',
      prizeName: 'Giải nhì',
      gift: 'Máy lọc không khí PANASONIC',
      time: 'Mẫu khởi tạo'
    }
  ]
};

let currentRotation = 0;
let isSpinning = false;
let lastTickSlice = -1;
let pendingWinner = null;

// Load saved state if available
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.participants) && Array.isArray(parsed.prizes) && parsed.prizes.length > 0) {
        state = {
          participants: parsed.participants,
          prizes: parsed.prizes,
          selectedPrizeId: parsed.selectedPrizeId || parsed.prizes[0].id,
          results: Array.isArray(parsed.results) ? parsed.results : []
        };
      }
    }
  } catch (e) {
    console.warn('Không thể tải dữ liệu lưu trữ:', e);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Không thể lưu dữ liệu:', e);
  }
}

// Canvas Drawing
const wheelCanvas = document.getElementById('wheelCanvas');
const ctx = wheelCanvas.getContext('2d');

function drawWheel() {
  const names = state.participants.length > 0 ? state.participants : ['HẾT DANH SÁCH'];
  const count = names.length;
  const centerX = wheelCanvas.width / 2;
  const centerY = wheelCanvas.height / 2;
  const radius = centerX - 10;
  const sliceAngle = (2 * Math.PI) / count;

  ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

  // Start from top (-90 deg)
  const baseOffset = -Math.PI / 2 + currentRotation;

  for (let i = 0; i < count; i++) {
    const startAngle = baseOffset + i * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    // Alternating elegant light cream & soft rose pink slices
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();

    let sliceBg = i % 2 === 0 ? '#fff6f6' : '#f7c6ce';
    if (count > 1 && count % 2 !== 0 && i === count - 1) {
      sliceBg = '#fae2e8'; // distinct shade so first and last slice don't merge
    }

    ctx.fillStyle = sliceBg;
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d99b38';
    ctx.stroke();

    // Draw participant name radially
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#5e040a';

    const fontSize = count <= 8 ? 22 : count <= 14 ? 18 : count <= 24 ? 14 : count <= 36 ? 11 : 9;
    ctx.font = `800 ${fontSize}px Montserrat, sans-serif`;

    const maxLen = count <= 10 ? 24 : count <= 20 ? 18 : 14;
    const label = names[i].length > maxLen ? names[i].slice(0, maxLen - 1) + '…' : names[i];

    if (count === 1) {
      ctx.textAlign = 'center';
      ctx.fillText(label, radius * 0.55, 0);
    } else {
      ctx.textAlign = 'right';
      ctx.fillText(label, radius - 34, 0);
    }

    ctx.restore();
  }

  // Outer metallic gold inner ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#e5a922';
  ctx.stroke();
}

function getActivePrize() {
  return state.prizes.find((p) => p.id === state.selectedPrizeId) || state.prizes[0] || null;
}

function updateUI() {
  const activePrize = getActivePrize();

  // Populate dropdown
  const select = document.getElementById('prizeSelect');
  select.innerHTML = state.prizes
    .map(
      (p) =>
        `<option value="${p.id}" ${p.id === activePrize?.id ? 'selected' : ''}>
          ${p.name} — còn ${p.remaining} giải
        </option>`
    )
    .join('');

  if (activePrize) {
    document.getElementById('activePrizeIcon').textContent = activePrize.icon || '🎁';
    document.getElementById('activePrizeTitle').textContent = activePrize.name || '';
    document.getElementById('activePrizeDesc').textContent = activePrize.gift || '';
    document.getElementById('showcaseTitle').textContent = activePrize.gift || '';
    document.getElementById('showcaseValue').textContent = activePrize.value || '';
    document.getElementById('statRemainingPrizes').textContent = activePrize.remaining;
  }

  const totalRemaining = state.prizes.reduce((sum, p) => sum + Number(p.remaining || 0), 0);
  document.getElementById('statParticipants').textContent = state.participants.length;
  document.getElementById('statTotalPrizes').textContent = totalRemaining;

  // Spin hint
  const hint = document.querySelector('.spin-hint');
  hint.textContent = `Quay với ${state.participants.length} người trong vòng quay. Mỗi người chỉ trúng tối đa 1 giải.`;

  // Recent winner
  if (state.results.length > 0) {
    const latest = state.results[0];
    document.getElementById('recentWinnerText').textContent =
      `${latest.name} — ${latest.prizeName} (${latest.gift})`;
  } else {
    document.getElementById('recentWinnerText').textContent = 'Chưa có lượt quay nào';
  }

  // Mini prizes grid
  const miniGrid = document.getElementById('prizesMiniGrid');
  miniGrid.innerHTML = state.prizes
    .map(
      (p) => `
      <div class="mini-prize-item ${p.id === activePrize?.id ? 'active' : ''}" data-prize-id="${p.id}">
        <div class="mini-prize-icon">${p.icon}</div>
        <div class="mini-prize-title">${p.name}</div>
        <div class="mini-prize-sub">${p.gift}</div>
        <div class="mini-prize-rem">Còn ${p.remaining}/${p.total}</div>
      </div>
    `
    )
    .join('');

  miniGrid.querySelectorAll('.mini-prize-item').forEach((el) => {
    el.addEventListener('click', () => {
      if (isSpinning) return;
      state.selectedPrizeId = el.dataset.prizeId;
      saveState();
      updateUI();
    });
  });

  // Update Manage tab inputs
  document.getElementById('manageCount').textContent = state.participants.length;
  document.getElementById('participantsInput').value = state.participants.join('\n');
  renderPrizesEditor();
  renderResultsTable();
  drawWheel();
}

function syncPrizesFromEditor() {
  const rows = document.querySelectorAll('.prize-edit-row');
  rows.forEach((row, idx) => {
    if (state.prizes[idx]) {
      const iconInput = row.querySelector('.edit-icon');
      const nameInput = row.querySelector('.edit-name');
      const giftInput = row.querySelector('.edit-gift');
      const remInput = row.querySelector('.edit-rem');
      if (iconInput) state.prizes[idx].icon = iconInput.value.trim() || '🎁';
      if (nameInput) state.prizes[idx].name = nameInput.value.trim() || 'Giải thưởng';
      if (giftInput) state.prizes[idx].gift = giftInput.value.trim() || 'Phần quà';
      if (remInput) {
        const rem = Math.max(0, parseInt(remInput.value, 10) || 0);
        state.prizes[idx].remaining = rem;
        state.prizes[idx].total = Math.max(rem, state.prizes[idx].total || rem);
      }
    }
  });
}

function renderPrizesEditor() {
  const container = document.getElementById('prizesEditorList');
  container.innerHTML = state.prizes
    .map(
      (p, idx) => `
      <div class="prize-edit-row" data-idx="${idx}">
        <input type="text" class="edit-icon" value="${p.icon}" title="Biểu tượng" />
        <input type="text" class="edit-name" value="${p.name}" placeholder="Tên giải" />
        <input type="text" class="edit-gift" value="${p.gift}" placeholder="Tên phần quà" />
        <input type="number" class="edit-rem" value="${p.remaining}" min="0" title="Số lượng còn" />
        <button class="btn-remove-row" data-idx="${idx}" title="Xóa giải">✕</button>
      </div>
    `
    )
    .join('');

  container.querySelectorAll('.btn-remove-row').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (state.prizes.length <= 1) {
        alert('Cần giữ lại ít nhất 1 giải thưởng!');
        return;
      }
      syncPrizesFromEditor();
      const idx = Number(btn.dataset.idx);
      state.prizes.splice(idx, 1);
      if (!state.prizes.some((p) => p.id === state.selectedPrizeId)) {
        state.selectedPrizeId = state.prizes[0].id;
      }
      renderPrizesEditor();
    });
  });
}

function renderResultsTable() {
  document.getElementById('resultsCount').textContent = state.results.length;
  const tbody = document.getElementById('resultsTableBody');
  if (state.results.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; opacity:0.7;">Chưa có dữ liệu trúng thưởng</td></tr>`;
    return;
  }

  tbody.innerHTML = state.results
    .map(
      (r, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${r.name}</strong></td>
        <td>${r.prizeName}</td>
        <td>${r.gift}</td>
        <td>${r.time}</td>
      </tr>
    `
    )
    .join('');
}

// Spin Logic
function spinWheel() {
  if (isSpinning) return;

  const activePrize = getActivePrize();
  if (!activePrize || activePrize.remaining <= 0) {
    alert('Giải thưởng đang chọn đã hết số lượng! Vui lòng chọn giải khác.');
    return;
  }

  if (state.participants.length === 0) {
    alert('Danh sách người tham gia đã trống!');
    return;
  }

  window.soundFX.init();
  isSpinning = true;
  document.getElementById('btnSpin').disabled = true;

  const count = state.participants.length;
  const winnerIndex = Math.floor(Math.random() * count);
  const sliceAngle = (2 * Math.PI) / count;

  // Pointer is at top (-PI/2). Slice i covers [baseOffset + i*sliceAngle, baseOffset + (i+1)*sliceAngle].
  // To align center of winnerIndex with top pointer:
  // currentRotation + (winnerIndex + 0.5) * sliceAngle ≡ 0 (mod 2*PI)
  const targetAngle = (2 * Math.PI - (winnerIndex + 0.5) * sliceAngle) % (2 * Math.PI);
  const currentMod = ((currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  let delta = targetAngle - currentMod;
  if (delta <= 0) delta += 2 * Math.PI;

  const extraSpins = (6 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
  const totalDelta = extraSpins + delta;
  const startRotation = currentRotation;
  const duration = 5200;
  const startTime = performance.now();

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Cubic ease-out
    const ease = 1 - Math.pow(1 - progress, 4);

    currentRotation = startRotation + totalDelta * ease;
    drawWheel();

    // Tick sound every slice crossing
    const normalized = ((currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const currentSlice = Math.floor(normalized / sliceAngle);
    if (currentSlice !== lastTickSlice) {
      lastTickSlice = currentSlice;
      window.soundFX.playTick();
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      document.getElementById('btnSpin').disabled = false;
      handleWin(winnerIndex, activePrize);
    }
  }

  requestAnimationFrame(animate);
}

function handleWin(winnerIndex, prize) {
  const winnerName = state.participants[winnerIndex];
  pendingWinner = { winnerIndex, winnerName, prizeId: prize.id };

  window.soundFX.playWin();
  window.confettiManager.launch(160);

  document.getElementById('modalWinnerName').textContent = winnerName;
  document.getElementById('modalPrizeName').textContent = prize.name;
  document.getElementById('modalPrizeDetail').textContent = prize.gift;
  document.getElementById('winnerModal').classList.remove('hidden');
}

function confirmWinner() {
  if (!pendingWinner) return;
  const { winnerIndex, winnerName, prizeId } = pendingWinner;
  const prize = state.prizes.find((p) => p.id === prizeId);

  // Remove winner so each person wins max 1 prize
  state.participants.splice(winnerIndex, 1);

  if (prize && prize.remaining > 0) {
    prize.remaining -= 1;
  }

  const nowStr = new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  state.results.unshift({
    name: winnerName,
    prizeName: prize ? prize.name : '',
    gift: prize ? prize.gift : '',
    time: nowStr
  });

  pendingWinner = null;
  document.getElementById('winnerModal').classList.add('hidden');
  saveState();
  updateUI();
}

// Event Listeners
document.getElementById('btnSpin').addEventListener('click', spinWheel);
document.getElementById('centerHub').addEventListener('click', spinWheel);
document.getElementById('btnConfirmWinner').addEventListener('click', confirmWinner);

document.getElementById('prizeSelect').addEventListener('change', (e) => {
  state.selectedPrizeId = e.target.value;
  saveState();
  updateUI();
});

// Tabs Navigation
document.querySelectorAll('.nav-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    if (isSpinning) return;
    document.querySelectorAll('.nav-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    const target = tab.dataset.tab;
    document.getElementById('tab-wheel').classList.toggle('hidden', target !== 'wheel');
    document.getElementById('tab-manage').classList.toggle('hidden', target !== 'manage');
    document.getElementById('tab-results').classList.toggle('hidden', target !== 'results');
  });
});

// Fullscreen toggle
document.getElementById('btnFullscreen').addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    document.getElementById('fullscreenText').textContent = 'Thoát toàn màn hình';
  } else {
    document.exitFullscreen().catch(() => {});
    document.getElementById('fullscreenText').textContent = 'Toàn màn hình';
  }
});

// Sound toggle
document.getElementById('btnSound').addEventListener('click', () => {
  window.soundFX.init();
  const on = window.soundFX.toggle();
  document.getElementById('soundIcon').textContent = on ? '🔊' : '🔇';
  document.getElementById('soundText').textContent = on ? 'Âm thanh: Bật' : 'Âm thanh: Tắt';
});

// Manage Participants Actions
document.getElementById('btnSaveParticipants').addEventListener('click', () => {
  const lines = document
    .getElementById('participantsInput')
    .value.split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    alert('Vui lòng nhập ít nhất 1 người tham gia!');
    return;
  }

  state.participants = lines;
  saveState();
  updateUI();
  alert('Đã cập nhật danh sách vòng quay!');
});

document.getElementById('btnShuffle').addEventListener('click', () => {
  for (let i = state.participants.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.participants[i], state.participants[j]] = [state.participants[j], state.participants[i]];
  }
  saveState();
  updateUI();
});

document.getElementById('btnResetDefault').addEventListener('click', () => {
  if (!confirm('Khôi phục lại danh sách và giải thưởng mặc định ban đầu?')) return;
  state.participants = [...DEFAULT_PARTICIPANTS];
  state.prizes = JSON.parse(JSON.stringify(DEFAULT_PRIZES));
  state.selectedPrizeId = 'first';
  saveState();
  updateUI();
});

// Manage Prizes Actions
document.getElementById('btnAddPrize').addEventListener('click', () => {
  syncPrizesFromEditor();
  state.prizes.push({
    id: 'prize_' + Date.now(),
    icon: '🎁',
    name: 'Giải khuyến khích',
    gift: 'Quà tặng tri ân',
    value: '',
    total: 5,
    remaining: 5
  });
  renderPrizesEditor();
});

document.getElementById('btnSavePrizes').addEventListener('click', () => {
  const rows = document.querySelectorAll('.prize-edit-row');
  const updated = [];
  rows.forEach((row, idx) => {
    const existing = state.prizes[idx];
    const rem = Math.max(0, parseInt(row.querySelector('.edit-rem').value, 10) || 0);
    updated.push({
      id: existing ? existing.id : 'prize_' + idx + '_' + Date.now(),
      icon: row.querySelector('.edit-icon').value.trim() || '🎁',
      name: row.querySelector('.edit-name').value.trim() || 'Giải thưởng',
      gift: row.querySelector('.edit-gift').value.trim() || 'Phần quà',
      value: existing ? existing.value : '',
      total: Math.max(rem, existing ? existing.total : rem),
      remaining: rem
    });
  });

  state.prizes = updated;
  if (!state.prizes.some((p) => p.id === state.selectedPrizeId)) {
    state.selectedPrizeId = state.prizes[0].id;
  }
  saveState();
  updateUI();
  alert('Đã lưu cơ cấu giải thưởng!');
});

// Results Actions
document.getElementById('btnClearResults').addEventListener('click', () => {
  if (!confirm('Xóa toàn bộ lịch sử kết quả trúng thưởng?')) return;
  state.results = [];
  saveState();
  updateUI();
});

document.getElementById('btnExportCSV').addEventListener('click', () => {
  if (state.results.length === 0) {
    alert('Chưa có dữ liệu kết quả để xuất!');
    return;
  }
  const header = ['STT', 'Họ và tên', 'Giải thưởng', 'Phần quà', 'Thời gian'];
  const rows = state.results.map((r, i) => [
    i + 1,
    `"${r.name.replace(/"/g, '""')}"`,
    `"${r.prizeName.replace(/"/g, '""')}"`,
    `"${r.gift.replace(/"/g, '""')}"`,
    `"${r.time}"`
  ]);
  const csvContent = '\uFEFF' + [header.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ket-qua-vong-quay-may-man.csv';
  a.click();
  URL.revokeObjectURL(url);
});

// Initialize
loadState();
updateUI();
