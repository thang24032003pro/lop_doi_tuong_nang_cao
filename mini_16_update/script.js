const Storage = {
  rooms: 'admin_rooms_data',
  transactions: 'admin_transactions_data',
  movies: 'admin_movies_data'
};

const SeatStatus = {
  NORMAL: 0,
  SOLD: 1,
  VIP: 2,
  COUPLE: 3,
  SELECTED: 4
};

const mathUtils = {
  formatCurrency(amount, currency = 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency
    }).format(amount);
  },

  calculateSeatPrice(basePrice, type) {
    const multipliers = { NORMAL: 1, VIP: 1.5, COUPLE: 2 };
    return basePrice * (multipliers[type] || 1);
  },

  deepClone(data) {
    return JSON.parse(JSON.stringify(data));
  },

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

const defaultMovies = [
  { id: 1, name: 'Mai', price: 70000, revenue: 0 },
  { id: 2, name: 'Lật Mặt 7', price: 80000, revenue: 0 },
  { id: 3, name: 'Avengers: Endgame', price: 90000, revenue: 0 },
  { id: 4, name: 'Dune Part Two', price: 100000, revenue: 0 }
];

const defaultRoomTemplate = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 1, 0],
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 0, 0, 0, 0, 0, 0, 2],
  [3, 3, 3, 3, 3, 3, 3, 3]
];

const referralTree = {
  KH001: [{ id: 'KH002', children: [{ id: 'KH004', children: [] }] }, { id: 'KH003', children: [] }],
  KH002: [{ id: 'KH004', children: [] }],
  KH003: [{ id: 'KH005', children: [{ id: 'KH006', children: [] }] }],
  KH004: [],
  KH005: [{ id: 'KH006', children: [] }],
  KH006: []
};

let rooms = loadRooms();
let movies = loadMovies();
let transactionHistory = loadTransactions();
let currentRoomIndex = 0;
let currentMovieId = movies[0].id;

const dom = {
  movieSelect: document.getElementById('movieSelect'),
  roomTabs: document.getElementById('roomTabs'),
  seatMap: document.getElementById('seatMap'),
  cartList: document.getElementById('cartList'),
  cartTotal: document.getElementById('cartTotal'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  messageBox: document.getElementById('messageBox'),
  customerName: document.getElementById('customerName'),
  customerId: document.getElementById('customerId'),
  searchMovie: document.getElementById('searchMovie'),
  sortMovie: document.getElementById('sortMovie'),
  movieList: document.getElementById('movieList'),
  totalRevenue: document.getElementById('totalRevenue'),
  totalTransactions: document.getElementById('totalTransactions'),
  totalVipTickets: document.getElementById('totalVipTickets'),
  reportList: document.getElementById('reportList'),
  searchTransaction: document.getElementById('searchTransaction'),
  transactionList: document.getElementById('transactionList'),
  referralSelect: document.getElementById('referralSelect'),
  calcPointBtn: document.getElementById('calcPointBtn'),
  referralResult: document.getElementById('referralResult'),
  resetBtn: document.getElementById('resetBtn'),
  mockBtn: document.getElementById('mockBtn')
};

function createDefaultRooms() {
  return [
    { id: 1, name: 'Phòng 1', seats: mathUtils.deepClone(defaultRoomTemplate) },
    { id: 2, name: 'Phòng 2', seats: mathUtils.deepClone(defaultRoomTemplate) },
    { id: 3, name: 'Phòng 3', seats: mathUtils.deepClone(defaultRoomTemplate) }
  ];
}

function loadRooms() {
  const data = localStorage.getItem(Storage.rooms);
  return data ? JSON.parse(data) : createDefaultRooms();
}

function loadMovies() {
  const data = localStorage.getItem(Storage.movies);
  return data ? JSON.parse(data) : mathUtils.deepClone(defaultMovies);
}

function loadTransactions() {
  const data = localStorage.getItem(Storage.transactions);
  return data ? JSON.parse(data) : [];
}

function updateStorage() {
  localStorage.setItem(Storage.rooms, JSON.stringify(rooms));
  localStorage.setItem(Storage.movies, JSON.stringify(movies));
  localStorage.setItem(Storage.transactions, JSON.stringify(transactionHistory));
}

function getCurrentRoom() {
  return rooms[currentRoomIndex] || rooms[0];
}

function getCurrentMovie() {
  return movies.find(movie => movie.id === currentMovieId) || movies[0];
}

function getOriginalType(row, col) {
  const value = defaultRoomTemplate[row][col];
  if (value === SeatStatus.VIP) return 'VIP';
  if (value === SeatStatus.COUPLE) return 'COUPLE';
  return 'NORMAL';
}

function getSeatName(row, col) {
  return String.fromCharCode(65 + row) + (col + 1);
}

function getSeatClass(status, row, col) {
  if (status === SeatStatus.SOLD) return 'seat sold';
  if (status === SeatStatus.SELECTED) return 'seat selected';
  const type = getOriginalType(row, col);
  if (type === 'VIP') return 'seat vip';
  if (type === 'COUPLE') return 'seat couple';
  return 'seat normal';
}

function getSelectedSeats() {
  const room = getCurrentRoom();
  const movie = getCurrentMovie();
  const selected = [];

  room.seats.forEach((row, rowIndex) => {
    row.forEach((status, colIndex) => {
      if (status === SeatStatus.SELECTED) {
        const type = getOriginalType(rowIndex, colIndex);
        selected.push({
          roomId: room.id,
          roomName: room.name,
          movieId: movie.id,
          movieName: movie.name,
          seatName: getSeatName(rowIndex, colIndex),
          rowIndex,
          colIndex,
          type,
          price: mathUtils.calculateSeatPrice(movie.price, type)
        });
      }
    });
  });

  return selected;
}

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

function clearSelectedSeats() {
  const room = getCurrentRoom();
  room.seats = room.seats.map((row, rowIndex) => {
    return row.map((status, colIndex) => {
      if (status === SeatStatus.SELECTED) {
        const type = getOriginalType(rowIndex, colIndex);
        if (type === 'VIP') return SeatStatus.VIP;
        if (type === 'COUPLE') return SeatStatus.COUPLE;
        return SeatStatus.NORMAL;
      }
      return status;
    });
  });
}

function renderMovieSelect() {
  dom.movieSelect.innerHTML = movies.map(movie => {
    return `<option value="${movie.id}">${movie.name} - ${mathUtils.formatCurrency(movie.price)}</option>`;
  }).join('');
  dom.movieSelect.value = currentMovieId;
}

function renderRoomTabs() {
  dom.roomTabs.innerHTML = rooms.map((room, index) => {
    const active = index === currentRoomIndex ? 'active' : '';
    return `<button class="btn room-btn ${active}" data-index="${index}">${room.name}</button>`;
  }).join('');

  document.querySelectorAll('.room-btn').forEach(button => {
    button.addEventListener('click', changeRoom);
  });
}

function renderSeats() {
  const room = getCurrentRoom();
  dom.seatMap.innerHTML = room.seats.map((row, rowIndex) => {
    const rowName = String.fromCharCode(65 + rowIndex);
    const seats = row.map((status, colIndex) => {
      return `<button class="${getSeatClass(status, rowIndex, colIndex)}" data-row="${rowIndex}" data-col="${colIndex}">${getSeatName(rowIndex, colIndex)}</button>`;
    }).join('');
    return `<div class="seat-row"><div class="row-label">${rowName}</div>${seats}</div>`;
  }).join('');

  document.querySelectorAll('.seat').forEach(button => {
    button.addEventListener('click', handleSeatClick);
  });
}

function renderCart() {
  const seats = getSelectedSeats();
  dom.cartList.innerHTML = seats.length ? seats.map(seat => {
    return `<div class="item"><div><strong>${seat.seatName}</strong><br>${seat.type} - ${seat.movieName}</div><strong>${mathUtils.formatCurrency(seat.price)}</strong></div>`;
  }).join('') : '<p>Chưa chọn ghế nào.</p>';
  dom.cartTotal.textContent = mathUtils.formatCurrency(calculateTotal(seats));
}

function renderMovieList() {
  const keyword = dom.searchMovie.value.trim().toLowerCase();
  const sortType = dom.sortMovie.value;
  let result = movies.filter(movie => movie.name.toLowerCase().includes(keyword));

  if (sortType === 'nameAsc') result.sort((a, b) => a.name.localeCompare(b.name));
  if (sortType === 'priceAsc') result.sort((a, b) => a.price - b.price);
  if (sortType === 'priceDesc') result.sort((a, b) => b.price - a.price);
  if (sortType === 'revenueDesc') result.sort((a, b) => b.revenue - a.revenue);

  dom.movieList.innerHTML = result.map(movie => {
    return `<div class="item"><div><strong>${movie.name}</strong><br>Giá: ${mathUtils.formatCurrency(movie.price)}</div><strong>${mathUtils.formatCurrency(movie.revenue)}</strong></div>`;
  }).join('');
}

function renderReports() {
  const vipTickets = transactionHistory.flatMap(tran => tran.items).filter(item => item.type === 'VIP');
  const totalRevenue = transactionHistory.reduce((sum, tran) => sum + tran.total, 0);
  const printableTickets = transactionHistory.flatMap(tran => tran.items.map(item => `${tran.customerName} - ${item.seatName}`));

  dom.totalRevenue.textContent = mathUtils.formatCurrency(totalRevenue);
  dom.totalTransactions.textContent = transactionHistory.length;
  dom.totalVipTickets.textContent = vipTickets.length;

  dom.reportList.innerHTML = `
    <div class="item"><strong>filter()</strong><span>${vipTickets.length} vé VIP đã bán</span></div>
    <div class="item"><strong>reduce()</strong><span>${mathUtils.formatCurrency(totalRevenue)}</span></div>
    <div class="item"><strong>map()</strong><span>${printableTickets.slice(0, 5).join(', ') || 'Chưa có vé'}</span></div>
  `;
}

function renderTransactions() {
  const keyword = dom.searchTransaction.value.trim().toLowerCase();
  const result = keyword
    ? transactionHistory.filter(tran => tran.customerId.toLowerCase().includes(keyword))
    : transactionHistory.slice(-8).reverse();

  dom.transactionList.innerHTML = result.length ? result.map(tran => {
    return `<div class="item"><div><strong>${tran.customerId}</strong><br>${tran.customerName} - ${tran.items.length} vé</div><strong>${mathUtils.formatCurrency(tran.total)}</strong></div>`;
  }).join('') : '<p>Không có giao dịch phù hợp.</p>';
}

function renderReferralOptions() {
  dom.referralSelect.innerHTML = Object.keys(referralTree).map(id => `<option value="${id}">${id}</option>`).join('');
}

function renderAll() {
  renderMovieSelect();
  renderRoomTabs();
  renderSeats();
  renderCart();
  renderMovieList();
  renderReports();
  renderTransactions();
  renderReferralOptions();
}

function changeRoom(event) {
  const index = Number(event.target.dataset.index);
  if (index < 0 || index >= rooms.length) return;
  clearSelectedSeats();
  currentRoomIndex = index;
  renderRoomTabs();
  renderSeats();
  renderCart();
}

function handleSeatClick(event) {
  const row = Number(event.target.dataset.row);
  const col = Number(event.target.dataset.col);
  const room = getCurrentRoom();
  const status = room.seats[row][col];

  if (status === SeatStatus.SOLD) {
    showMessage('Ghế đã bán, không thể chọn.', 'error');
    return;
  }

  room.seats[row][col] = status === SeatStatus.SELECTED
    ? restoreSeatStatus(row, col)
    : SeatStatus.SELECTED;

  renderSeats();
  renderCart();
}

function restoreSeatStatus(row, col) {
  const type = getOriginalType(row, col);
  if (type === 'VIP') return SeatStatus.VIP;
  if (type === 'COUPLE') return SeatStatus.COUPLE;
  return SeatStatus.NORMAL;
}

function validateCheckout(seats, customerId, customerName) {
  if (!seats.length) throw new Error('Giỏ hàng đang rỗng.');
  if (!customerId.trim()) throw new Error('Vui lòng nhập mã khách hàng.');
  if (!customerName.trim()) throw new Error('Vui lòng nhập tên khách hàng.');
}

function createTransaction(seats, customerId, customerName) {
  return {
    id: 'GD' + Date.now(),
    customerId,
    customerName,
    createdAt: new Date().toLocaleString('vi-VN'),
    items: mathUtils.deepClone(seats),
    total: calculateTotal(seats)
  };
}

function markSelectedAsSold(seats) {
  const room = getCurrentRoom();
  seats.forEach(seat => {
    room.seats[seat.rowIndex][seat.colIndex] = SeatStatus.SOLD;
  });
}

function updateMovieRevenue(movieId, amount) {
  const movie = movies.find(item => item.id === movieId);
  if (movie) movie.revenue += amount;
}

function checkout() {
  try {
    const seats = getSelectedSeats();
    const customerId = dom.customerId.value.trim();
    const customerName = dom.customerName.value.trim();
    validateCheckout(seats, customerId, customerName);

    const transaction = createTransaction(seats, customerId, customerName);
    transactionHistory.push(transaction);
    markSelectedAsSold(seats);
    updateMovieRevenue(getCurrentMovie().id, transaction.total);
    updateStorage();
    renderAll();
    showMessage('Chốt đơn thành công. Lịch sử đã được deep clone.', 'success');
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

function showMessage(text, type) {
  dom.messageBox.textContent = text;
  dom.messageBox.className = `message show ${type}`;
}

function calculateReferralPoints(customerId, level = 1, visited = new Set()) {
  if (visited.has(customerId)) return 0;
  visited.add(customerId);

  const children = referralTree[customerId] || [];
  if (!children.length) return 0;

  return children.reduce((sum, child) => {
    const directPoint = level === 1 ? 10 : 5;
    return sum + directPoint + calculateReferralPoints(child.id, level + 1, visited);
  }, 0);
}

function handleReferralCalculation() {
  const customerId = dom.referralSelect.value;
  const points = calculateReferralPoints(customerId);
  dom.referralResult.textContent = `${customerId} có tổng ${points} điểm thưởng từ mạng lưới giới thiệu.`;
}

function generateMockTransactions() {
  const names = ['An', 'Bình', 'Chi', 'Dũng', 'Hà', 'Linh', 'Nam', 'Phúc'];
  const newTransactions = [];

  for (let i = 0; i < 1000; i++) {
    const movie = movies[mathUtils.getRandomInt(0, movies.length - 1)];
    const type = ['NORMAL', 'VIP', 'COUPLE'][mathUtils.getRandomInt(0, 2)];
    const price = mathUtils.calculateSeatPrice(movie.price, type);

    newTransactions.push({
      id: 'MOCK' + Date.now() + i,
      customerId: 'KH' + String(mathUtils.getRandomInt(1, 999)).padStart(3, '0'),
      customerName: names[mathUtils.getRandomInt(0, names.length - 1)],
      createdAt: new Date().toLocaleString('vi-VN'),
      items: [{ movieName: movie.name, seatName: 'A' + mathUtils.getRandomInt(1, 8), type, price }],
      total: price
    });

    movie.revenue += price;
  }

  transactionHistory = transactionHistory.concat(newTransactions);
  updateStorage();
  renderAll();
  showMessage('Đã tạo 1000 giao dịch mock để kiểm tra hiệu năng.', 'success');
}

function resetData() {
  if (!confirm('Bạn có chắc muốn reset dữ liệu không?')) return;
  localStorage.removeItem(Storage.rooms);
  localStorage.removeItem(Storage.movies);
  localStorage.removeItem(Storage.transactions);
  rooms = createDefaultRooms();
  movies = mathUtils.deepClone(defaultMovies);
  transactionHistory = [];
  currentRoomIndex = 0;
  currentMovieId = movies[0].id;
  renderAll();
}

dom.movieSelect.addEventListener('change', event => {
  currentMovieId = Number(event.target.value);
  clearSelectedSeats();
  renderSeats();
  renderCart();
});

dom.searchMovie.addEventListener('input', renderMovieList);
dom.sortMovie.addEventListener('change', renderMovieList);
dom.checkoutBtn.addEventListener('click', checkout);
dom.searchTransaction.addEventListener('input', renderTransactions);
dom.calcPointBtn.addEventListener('click', handleReferralCalculation);
dom.resetBtn.addEventListener('click', resetData);
dom.mockBtn.addEventListener('click', generateMockTransactions);

renderAll();
