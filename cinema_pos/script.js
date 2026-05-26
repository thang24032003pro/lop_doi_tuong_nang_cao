const STORAGE_SEATS_KEY = 'cinema_pos_seats';
const STORAGE_REVENUE_KEY = 'cinema_pos_revenue_history';
const ADMIN_PASSWORD = '123456';

const SEAT_EMPTY = 0;
const SEAT_SOLD = 1;
const SEAT_VIP = 2;
const SEAT_COUPLE = 3;
const SEAT_SELECTED = 4;

const movies = [
  { id: 1, name: 'Mai - Suất 18:30', basePrice: 70000 },
  { id: 2, name: 'Lật Mặt 7 - Suất 20:00', basePrice: 80000 },
  { id: 3, name: 'Avengers: Endgame - Suất 21:30', basePrice: 90000 }
];

const defaultSeatMap = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 1, 0],
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 0, 0, 0, 0, 0, 0, 2],
  [3, 3, 3, 3, 3, 3, 3, 3]
];

function loadAllSeats() {
  const saved = localStorage.getItem(STORAGE_SEATS_KEY);
  return saved ? JSON.parse(saved) : {};
}

function getSeatsForMovie(movieId) {
  const all = loadAllSeats();
  if (all && all[movieId]) return JSON.parse(JSON.stringify(all[movieId]));
  return JSON.parse(JSON.stringify(defaultSeatMap));
}

function saveSeatsForMovie(movieId, map) {
  const all = loadAllSeats();
  all[movieId] = map;
  localStorage.setItem(STORAGE_SEATS_KEY, JSON.stringify(all));
}

let currentMovie = movies[0];
let seatMap = getSeatsForMovie(currentMovie.id);
let revenueHistory = loadRevenueHistory();

const movieSelect = document.getElementById('movieSelect');
const basePriceText = document.getElementById('basePriceText');
const seatMapElement = document.getElementById('seatMap');
const cartList = document.getElementById('cartList');
const totalPrice = document.getElementById('totalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');
const autoPickBtn = document.getElementById('autoPickBtn');
const autoPickNumber = document.getElementById('autoPickNumber');
const messageBox = document.getElementById('messageBox');
const revenueText = document.getElementById('revenueText');
const chartCanvas = document.getElementById('revenueChart');
const resetBtn = document.getElementById('resetBtn');

function loadRevenueHistory() {
  const savedRevenue = localStorage.getItem(STORAGE_REVENUE_KEY);
  if (savedRevenue) return JSON.parse(savedRevenue);
  return [];
}

function saveData() {
  // save seats only for the current movie
  saveSeatsForMovie(currentMovie.id, seatMap);
  localStorage.setItem(STORAGE_REVENUE_KEY, JSON.stringify(revenueHistory));
}

function formatMoney(value) {
  return value.toLocaleString('vi-VN') + 'đ';
}

function getSeatName(rowIndex, colIndex) {
  const rowName = String.fromCharCode(65 + rowIndex);
  return rowName + (colIndex + 1);
}

function getSeatType(status) {
  switch (status) {
    case SEAT_VIP: return 'VIP';
    case SEAT_COUPLE: return 'Couple';
    default: return 'Thường';
  }
}

function getSeatMultiplier(status) {
  switch (status) {
    case SEAT_VIP: return 1.5;
    case SEAT_COUPLE: return 2;
    default: return 1;
  }
}

function getOriginalSeatType(rowIndex, colIndex) {
  const originalStatus = defaultSeatMap[rowIndex][colIndex];
  if (originalStatus === SEAT_VIP) return SEAT_VIP;
  if (originalStatus === SEAT_COUPLE) return SEAT_COUPLE;
  return SEAT_EMPTY;
}

function getSeatClass(status, rowIndex, colIndex) {
  if (status === SEAT_SOLD) return 'seat sold';
  if (status === SEAT_SELECTED) return 'seat selected';
  const originalStatus = getOriginalSeatType(rowIndex, colIndex);
  if (originalStatus === SEAT_VIP) return 'seat vip';
  if (originalStatus === SEAT_COUPLE) return 'seat couple';
  return 'seat normal';
}

function renderMovies() {
  movieSelect.innerHTML = movies.map(movie => `<option value="${movie.id}">${movie.name}</option>`).join('');
  movieSelect.value = currentMovie.id;
  basePriceText.textContent = formatMoney(currentMovie.basePrice);
}

function renderSeats() {
  seatMapElement.innerHTML = seatMap.map((row, rowIndex) => {
    const rowLabel = String.fromCharCode(65 + rowIndex);
    const seats = row.map((status, colIndex) => {
      const seatName = getSeatName(rowIndex, colIndex);
      const className = getSeatClass(status, rowIndex, colIndex);
      return `<button class="${className}" data-row="${rowIndex}" data-col="${colIndex}">${seatName}</button>`;
    }).join('');
    return `<div class="seat-row"><div class="row-label">${rowLabel}</div>${seats}</div>`;
  }).join('');
  document.querySelectorAll('.seat').forEach(button => button.addEventListener('click', handleSeatClick));
}

function handleSeatClick(event) {
  const rowIndex = Number(event.target.dataset.row);
  const colIndex = Number(event.target.dataset.col);
  const currentStatus = seatMap[rowIndex][colIndex];
  if (currentStatus === SEAT_SOLD) { showMessage('Ghế này đã bán, không thể chọn.', 'error'); return; }
  seatMap[rowIndex][colIndex] = currentStatus === SEAT_SELECTED ? getOriginalSeatType(rowIndex, colIndex) : SEAT_SELECTED;
  renderSeats(); renderCart();
}

function getSelectedSeats() {
  const selectedSeats = [];
  seatMap.forEach((row, rowIndex) => row.forEach((status, colIndex) => {
    if (status === SEAT_SELECTED) {
      const originalType = getOriginalSeatType(rowIndex, colIndex);
      const price = currentMovie.basePrice * getSeatMultiplier(originalType);
      selectedSeats.push({ rowIndex, colIndex, name: getSeatName(rowIndex, colIndex), type: getSeatType(originalType), price });
    }
  }));
  return selectedSeats;
}

function calculateTotal() { return getSelectedSeats().reduce((sum, seat) => sum + seat.price, 0); }

function renderCart() {
  const selectedSeats = getSelectedSeats();
  if (!selectedSeats.length) { cartList.innerHTML = '<p>Chưa có ghế nào được chọn.</p>'; }
  else { cartList.innerHTML = selectedSeats.map(seat => `
    <div class="cart-item">
      <div>
        <strong>${seat.name}</strong><br />
        <span>${seat.type}</span>
      </div>
      <strong>${formatMoney(seat.price)}</strong>
    </div>
  `).join(''); }
  totalPrice.textContent = formatMoney(calculateTotal());
}

function hasVipSeat(selectedSeats) { return selectedSeats.some(seat => seat.type === 'VIP'); }

function checkout() {
  try {
    const selectedSeats = getSelectedSeats(); const total = calculateTotal();
    if (!selectedSeats.length) throw new Error('Giỏ hàng đang rỗng. Vui lòng chọn ít nhất một ghế.');
    if (hasVipSeat(selectedSeats)) { const password = prompt('Có ghế VIP trong giỏ hàng. Vui lòng nhập mã Admin:'); if (password !== ADMIN_PASSWORD) throw new Error('Mã Admin không đúng. Không thể thanh toán ghế VIP.'); }
    const isConfirmed = confirm(`Xác nhận thanh toán ${formatMoney(total)}?`); if (!isConfirmed) return;
    selectedSeats.forEach(seat => { seatMap[seat.rowIndex][seat.colIndex] = SEAT_SOLD; });
    revenueHistory.push({ time: new Date().toLocaleTimeString('vi-VN'), total });
    saveData(); renderSeats(); renderCart(); renderRevenue(); showMessage('Thanh toán thành công. Vé đã được xuất.', 'success');
  } catch (error) { showMessage(error.message, 'error'); console.warn(error.message); }
}

function clearSelectedSeats() { seatMap = seatMap.map((row, rowIndex) => row.map((status, colIndex) => status === SEAT_SELECTED ? getOriginalSeatType(rowIndex, colIndex) : status)); }

function isSeatAvailable(rowIndex, colIndex) { return seatMap[rowIndex][colIndex] !== SEAT_SOLD && seatMap[rowIndex][colIndex] !== SEAT_SELECTED; }

function findAdjacentSeats(map, quantity) {
  for (let rowIndex = 0; rowIndex < map.length; rowIndex++) {
    let foundSeats = [];
    for (let colIndex = 0; colIndex < map[rowIndex].length; colIndex++) {
      if (isSeatAvailable(rowIndex, colIndex)) { foundSeats.push({ rowIndex, colIndex }); if (foundSeats.length === quantity) return foundSeats; }
      else { foundSeats = []; }
    }
  }
  return [];
}

function autoPickSeats() {
  const quantity = Number(autoPickNumber.value);
  if (!quantity || quantity < 1) { showMessage('Vui lòng nhập số lượng khách hợp lệ.', 'error'); return; }
  clearSelectedSeats();
  const seats = findAdjacentSeats(seatMap, quantity);
  if (!seats.length) { showMessage(`Không tìm thấy ${quantity} ghế trống liền kề trên cùng một hàng.`, 'error'); renderSeats(); renderCart(); return; }
  seats.forEach(seat => { seatMap[seat.rowIndex][seat.colIndex] = SEAT_SELECTED; });
  renderSeats(); renderCart(); showMessage(`Đã chọn nhanh ${quantity} ghế liền kề.`, 'success');
}

function renderRevenue() { const totalRevenue = revenueHistory.reduce((sum, item) => sum + item.total, 0); revenueText.textContent = formatMoney(totalRevenue); drawRevenueChart(); }

function drawRevenueChart() {
  const ctx = chartCanvas.getContext('2d'); const width = chartCanvas.width; const height = chartCanvas.height; const padding = 36;
  ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(padding, padding); ctx.lineTo(padding, height - padding); ctx.lineTo(width - padding, height - padding); ctx.stroke();
  if (!revenueHistory.length) { ctx.fillStyle = '#64748b'; ctx.font = '16px Arial'; ctx.textAlign = 'center'; ctx.fillText('Chưa có doanh thu', width / 2, height / 2); return; }
  const maxRevenue = Math.max(...revenueHistory.map(item => item.total)); const barAreaWidth = width - padding * 2; const barWidth = Math.max(24, barAreaWidth / revenueHistory.length - 12);
  revenueHistory.forEach((item, index) => { const barHeight = (item.total / maxRevenue) * (height - padding * 2 - 20); const x = padding + index * (barWidth + 12) + 8; const y = height - padding - barHeight; ctx.fillStyle = '#2563eb'; ctx.fillRect(x, y, barWidth, barHeight); ctx.fillStyle = '#111827'; ctx.font = '11px Arial'; ctx.textAlign = 'center'; ctx.fillText(index + 1, x + barWidth / 2, height - 14); });
}

function showMessage(message, type) { messageBox.textContent = message; messageBox.className = `message show ${type}`; }

function resetData() { const confirmReset = confirm('Bạn có chắc muốn reset toàn bộ dữ liệu ghế và doanh thu không?'); if (!confirmReset) return; localStorage.removeItem(STORAGE_SEATS_KEY); localStorage.removeItem(STORAGE_REVENUE_KEY); seatMap = JSON.parse(JSON.stringify(defaultSeatMap)); revenueHistory = []; renderSeats(); renderCart(); renderRevenue(); showMessage('Đã reset dữ liệu.', 'success'); }
movieSelect.addEventListener('change', function () {
  // save current movie seats before switching
  saveSeatsForMovie(currentMovie.id, seatMap);
  const movieId = Number(this.value);
  currentMovie = movies.find(movie => movie.id === movieId) || movies[0];
  basePriceText.textContent = formatMoney(currentMovie.basePrice);
  seatMap = getSeatsForMovie(currentMovie.id);
  renderSeats(); renderCart();
});
checkoutBtn.addEventListener('click', checkout);
autoPickBtn.addEventListener('click', autoPickSeats);
resetBtn.addEventListener('click', resetData);

renderMovies(); renderSeats(); renderCart(); renderRevenue();
