window.addEventListener('DOMContentLoaded', () => {
  const dom = {
    navButtons: document.querySelectorAll('.nav-btn'),
    clientView: document.getElementById('clientView'),
    adminView: document.getElementById('adminView'),
    hotelMap: document.getElementById('hotelMap'),
    bookingForm: document.getElementById('bookingForm'),
    customerId: document.getElementById('customerId'),
    customerName: document.getElementById('customerName'),
    customerPhone: document.getElementById('customerPhone'),
    referredBy: document.getElementById('referredBy'),
    selectedRoom: document.getElementById('selectedRoom'),
    formMessage: document.getElementById('formMessage'),
    discountMessage: document.getElementById('discountMessage'),
    typeFilter: document.getElementById('typeFilter'),
    maxPriceFilter: document.getElementById('maxPriceFilter'),
    applyFilterBtn: document.getElementById('applyFilterBtn'),
    clearFilterBtn: document.getElementById('clearFilterBtn'),
    groupQuantity: document.getElementById('groupQuantity'),
    suggestBtn: document.getElementById('suggestBtn'),
    totalRevenue: document.getElementById('totalRevenue'),
    totalBookings: document.getElementById('totalBookings'),
    highValueBookings: document.getElementById('highValueBookings'),
    bookingTableBody: document.getElementById('bookingTableBody'),
    customerTableBody: document.getElementById('customerTableBody'),
    arrayReport: document.getElementById('arrayReport'),
    revenueChart: document.getElementById('revenueChart'),
    // admin room management
    adminRoomForm: document.getElementById('adminRoomForm'),
    adminRoomId: document.getElementById('adminRoomId'),
    adminRoomType: document.getElementById('adminRoomType'),
    adminRoomFloor: document.getElementById('adminRoomFloor'),
    adminRoomPrice: document.getElementById('adminRoomPrice'),
    adminAddRoom: document.getElementById('adminAddRoom'),
    adminUpdateRoom: document.getElementById('adminUpdateRoom'),
    adminClearRoom: document.getElementById('adminClearRoom'),
    roomsTableBody: document.getElementById('roomsTableBody'),
    sortAscBtn: document.getElementById('sortAscBtn'),
    sortDescBtn: document.getElementById('sortDescBtn'),
    resetBtn: document.getElementById('resetBtn')
  };

  let bookingSystem = loadData();
  let selectedRoomId = null;
  let highlightedRoomIds = [];
  let filteredRoomIds = null;
  let currentBookingRows = bookingSystem.bookingHistory;

  function switchView(viewId) {
    const isClient = viewId === 'clientView';
    dom.clientView.hidden = !isClient;
    dom.adminView.hidden = isClient;
    dom.clientView.classList.toggle('active-view', isClient);
    dom.adminView.classList.toggle('active-view', !isClient);

    dom.navButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.view === viewId);
    });

    if (!isClient) renderAdmin();
  }

  function getRoomClass(room) {
    if (room.id === selectedRoomId) return 'room-card bg-selected';
    if (highlightedRoomIds.includes(room.id)) return 'room-card bg-highlight';
    return room.isBooked ? 'room-card bg-red' : 'room-card bg-green';
  }

  function renderHotelMap() {
    dom.hotelMap.innerHTML = bookingSystem.roomsMatrix.map((floorRooms, floorIndex) => {
      const rooms = floorRooms.map(room => {
        const shouldHide = filteredRoomIds && !filteredRoomIds.includes(room.id);
        const hiddenClass = shouldHide ? 'hidden-room' : '';
        return `
          <button class="${getRoomClass(room)} ${hiddenClass}" type="button" data-room-id="${room.id}">
            <span>Phòng ${room.id}</span>
            <strong>${room.type}</strong>
            <small>${formatCurrency(room.basePrice)}</small>
            <em>${room.isBooked ? 'Đã đặt' : 'Còn trống'}</em>
          </button>
        `;
      }).join('');

      return `
        <section class="floor-block">
          <div class="floor-title"><h3>Tầng ${floorIndex + 1}</h3><span>${floorRooms.length} phòng</span></div>
          <div class="floor-grid">${rooms}</div>
        </section>
      `;
    }).join('');

    document.querySelectorAll('.room-card').forEach(button => {
      button.addEventListener('click', () => {
        const room = bookingSystem.findRoom(button.dataset.roomId);
        handleRoomClick(room);
      });
    });
  }

  function handleRoomClick(room) {
    if (!room) return;
    if (room.isBooked) {
      showMessage('Phòng đã được đặt, vui lòng chọn phòng khác.', 'error');
      return;
    }

    selectedRoomId = room.id;
    dom.selectedRoom.value = `Phòng ${room.id} - ${room.type} - ${formatCurrency(room.basePrice)}`;
    showMessage('Đã chọn phòng.', 'success');
    renderHotelMap();
  }

  function fillCustomerById() {
    const customer = bookingSystem.findCustomer(dom.customerId.value.trim());
    if (!customer) return;
    dom.customerName.value = customer.name;
    dom.customerPhone.value = customer.phone;
    dom.referredBy.value = customer.referredBy || '';
  }

  function getFormCustomer() {
    const id = dom.customerId.value.trim();
    const currentCustomer = bookingSystem.findCustomer(id);
    const referredBy = dom.referredBy.value.trim() || currentCustomer?.referredBy || null;
    return new Customer(id, dom.customerName.value.trim() || currentCustomer?.name || '', dom.customerPhone.value.trim() || currentCustomer?.phone || '', referredBy);
  }

  function validateBooking(customer) {
    if (!customer.id) throw new Error('Vui lòng nhập mã khách hàng.');
    if (!customer.name) throw new Error('Vui lòng nhập tên khách hàng.');
    if (!customer.phone) throw new Error('Vui lòng nhập số điện thoại.');
    if (!/^0\d{9}$/.test(customer.phone)) throw new Error('Số điện thoại phải có 10 số và bắt đầu bằng 0.');
    if (!selectedRoomId) throw new Error('Vui lòng chọn phòng trống.');
  }

  function getPreviewCustomers(customer) {
    const customers = [...bookingSystem.customers];
    const index = customers.findIndex(item => item.id === customer.id);
    if (index >= 0) customers[index] = customer;
    else customers.push(customer);
    return customers;
  }

  function getDiscountPercent(customer) {
    const points = calculateReferralPoints(customer.id, getPreviewCustomers(customer));
    return points >= 20 ? 0.05 : 0;
  }

  function updateDiscountPreview() {
    fillCustomerById();
    const customer = getFormCustomer();
    if (!customer.id) {
      dom.discountMessage.classList.add('hidden');
      return;
    }

    const points = calculateReferralPoints(customer.id, getPreviewCustomers(customer));
    if (points >= 20) {
      dom.discountMessage.textContent = 'Bạn được giảm 5% nhờ điểm thưởng referral.';
      dom.discountMessage.classList.remove('hidden');
    } else {
      dom.discountMessage.classList.add('hidden');
    }
  }

  function handleBookingSubmit(event) {
    event.preventDefault();
    try {
      const customer = getFormCustomer();
      validateBooking(customer);
      const discount = getDiscountPercent(customer);
      const booking = bookingSystem.createBooking(customer, selectedRoomId, discount);

      saveData(bookingSystem);
      selectedRoomId = null;
      highlightedRoomIds = [];
      filteredRoomIds = null;
      currentBookingRows = bookingSystem.bookingHistory;
      dom.bookingForm.reset();
      dom.selectedRoom.value = '';
      dom.discountMessage.classList.add('hidden');

      renderAll();
      showMessage(`Đặt phòng thành công: ${booking.id}`, 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  }

  function showMessage(text, type) {
    dom.formMessage.textContent = text;
    dom.formMessage.className = `form-message ${type}`;
  }

  function applyRoomFilter() {
    const type = dom.typeFilter.value;
    const maxPrice = dom.maxPriceFilter.value ? Number(dom.maxPriceFilter.value) : Infinity;
    const rooms = bookingSystem.getAvailableRooms(type, maxPrice);
    filteredRoomIds = rooms.map(room => room.id);
    highlightedRoomIds = [];
    selectedRoomId = null;
    dom.selectedRoom.value = '';
    renderHotelMap();
    showMessage(`Tìm thấy ${rooms.length} phòng phù hợp.`, 'success');
  }

  function clearFilter() {
    filteredRoomIds = null;
    highlightedRoomIds = [];
    selectedRoomId = null;
    dom.typeFilter.value = 'all';
    dom.maxPriceFilter.value = '';
    dom.groupQuantity.value = '';
    dom.selectedRoom.value = '';
    renderHotelMap();
    showMessage('Đã bỏ lọc.', 'success');
  }

  function suggestAdjacentRooms() {
    try {
      const rooms = bookingSystem.suggestAdjacentRooms(Number(dom.groupQuantity.value));
      highlightedRoomIds = rooms ? rooms.map(room => room.id) : [];
      filteredRoomIds = null;
      selectedRoomId = null;
      dom.selectedRoom.value = '';
      renderHotelMap();

      if (!rooms) {
        showMessage('Không tìm thấy dãy phòng liền kề.', 'error');
        return;
      }

      showMessage(`Gợi ý phòng: ${highlightedRoomIds.join(', ')}`, 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  }

  function renderStats() {
    const report = bookingSystem.getAdminReport();
    dom.totalRevenue.textContent = formatCurrency(report.totalRevenue);
    dom.totalBookings.textContent = bookingSystem.bookingHistory.length;
    dom.highValueBookings.textContent = report.highValueBookings.length;
  }

  function renderBookingTable(rows = currentBookingRows) {
    dom.bookingTableBody.innerHTML = rows.length ? rows.map(booking => `
      <tr>
        <td>${booking.id}</td>
        <td>${booking.customer.name}</td>
        <td>${booking.customer.phone}</td>
        <td>${booking.roomSnapshot.id}</td>
        <td><span class="type-pill ${booking.roomSnapshot.type.toLowerCase()}">${booking.roomSnapshot.type}</span></td>
        <td>${formatCurrency(booking.originalPrice)}</td>
        <td>${booking.discountPercent * 100}%</td>
        <td><strong>${formatCurrency(booking.totalPrice)}</strong></td>
        <td>${booking.createdAt}</td>
      </tr>
    `).join('') : '<tr><td colspan="9">Chưa có giao dịch.</td></tr>';
  }

  function renderCustomerTable() {
    dom.customerTableBody.innerHTML = bookingSystem.customers.map(customer => {
      const points = calculateReferralPoints(customer.id, bookingSystem.customers);
      return `
        <tr>
          <td>${customer.id}</td>
          <td>${customer.name}</td>
          <td>${customer.referredBy || 'Không có'}</td>
          <td><strong>${points}</strong></td>
        </tr>
      `;
    }).join('');
  }

  function renderArrayReport() {
    const report = bookingSystem.getAdminReport();
    dom.arrayReport.innerHTML = `
      <div class="report-card"><strong>filter()</strong><span>${report.highValueBookings.length} hóa đơn trên 2 triệu</span></div>
      <div class="report-card"><strong>reduce()</strong><span>${formatCurrency(report.totalRevenue)}</span></div>
      <div class="report-card"><strong>map()</strong><span>${report.customerNames.join(', ') || 'Chưa có dữ liệu'}</span></div>
    `;
  }

  function drawRevenueChart() {
    const canvas = dom.revenueChart;
    const ctx = canvas.getContext('2d');
    const data = bookingSystem.getRevenueByRoomType();
    const labels = Object.keys(data);
    const values = Object.values(data);
    const maxValue = Math.max(...values, 1);
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 18px Arial';
    ctx.fillText('Doanh thu theo loại phòng', 24, 34);

    labels.forEach((label, index) => {
      const barWidth = 120;
      const gap = 88;
      const x = 78 + index * (barWidth + gap);
      const barHeight = Math.max((values[index] / maxValue) * 210, values[index] ? 10 : 0);
      const y = 278 - barHeight;
      const colors = ['#14b8a6', '#6366f1', '#f59e0b'];

      ctx.fillStyle = colors[index];
      ctx.fillRect(x, y, barWidth, barHeight);
      ctx.fillStyle = '#334155';
      ctx.font = '600 14px Arial';
      ctx.fillText(label, x + 18, 310);
      ctx.fillText(formatCurrency(values[index]), x - 18, y - 10);
    });
  }

  function sortBookings(direction) {
    currentBookingRows = bookingSystem.sortBookingsByTotal(direction);
    renderBookingTable(currentBookingRows);
  }

  function resetData() {
    localStorage.removeItem(STORAGE_KEY);
    bookingSystem = loadData();
    selectedRoomId = null;
    highlightedRoomIds = [];
    filteredRoomIds = null;
    currentBookingRows = bookingSystem.bookingHistory;
    dom.bookingForm.reset();
    dom.selectedRoom.value = '';
    renderAll();
    showMessage('Đã khôi phục dữ liệu mẫu.', 'success');
  }

  function renderAdmin() {
    renderStats();
    renderBookingTable(currentBookingRows);
    renderCustomerTable();
    renderArrayReport();
    drawRevenueChart();
    renderRoomsTable();
  }

  // --- Admin Room CRUD UI ---
  function renderRoomsTable(){
    const rows = bookingSystem.roomsMatrix.flat();
    dom.roomsTableBody.innerHTML = rows.map(r=>`
      <tr>
        <td>${r.id}</td>
        <td>${r.type}</td>
        <td>${r.floor}</td>
        <td>${formatCurrency(r.basePrice)}</td>
        <td>
          <button class="btn btn-secondary btn-edit" data-id="${r.id}">Edit</button>
          <button class="btn btn-light btn-delete" data-id="${r.id}">Delete</button>
        </td>
      </tr>
    `).join('');
    // event delegation used (single listener attached in bindEvents)
  }

  function handleRoomsTableClick(e){
    const btn = e.target.closest('button');
    if(!btn || !dom.roomsTableBody.contains(btn)) return;
    const id = btn.dataset.id;
    if(btn.classList.contains('btn-edit')){
      const room = bookingSystem.findRoom(id);
      if(!room) return;
      dom.adminRoomId.value = room.id; dom.adminRoomType.value = room.type; dom.adminRoomFloor.value = room.floor; dom.adminRoomPrice.value = room.basePrice;
    } else if(btn.classList.contains('btn-delete')){
      if(!confirm(`Xóa phòng ${id}?`)) return;
      try{ bookingSystem.deleteRoom(id); saveData(bookingSystem); renderAll(); showMessage('Xóa phòng thành công','success'); }
      catch(err){ showMessage(err.message,'error'); }
    }
  }

  function clearAdminRoomForm(){ dom.adminRoomForm.reset(); }

  function handleAdminAdd(){
    try{
      const id = dom.adminRoomId.value.trim(); if(!id) throw new Error('Nhập mã phòng.');
      const type = dom.adminRoomType.value; const floor = Number(dom.adminRoomFloor.value)||1; const price = Number(dom.adminRoomPrice.value)||0;
      const newRoom = new Room(id,type,floor,price,false);
      bookingSystem.addRoom(floor-1,newRoom);
      saveData(bookingSystem); renderAll(); clearAdminRoomForm(); showMessage('Thêm phòng thành công','success');
    }catch(err){ showMessage(err.message,'error'); }
  }

  function handleAdminUpdate(){
    try{
      const id = dom.adminRoomId.value.trim(); if(!id) throw new Error('Nhập mã phòng cần sửa.');
      const updates = { type: dom.adminRoomType.value, floor: Number(dom.adminRoomFloor.value)||undefined, basePrice: Number(dom.adminRoomPrice.value)||undefined };
      bookingSystem.updateRoom(id, updates);
      saveData(bookingSystem); renderAll(); clearAdminRoomForm(); showMessage('Cập nhật phòng thành công','success');
    }catch(err){ showMessage(err.message,'error'); }
  }

  function renderAll() {
    renderHotelMap();
    renderAdmin();
  }

  function bindEvents() {
    dom.navButtons.forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
    dom.bookingForm.addEventListener('submit', handleBookingSubmit);
    dom.applyFilterBtn.addEventListener('click', applyRoomFilter);
    dom.clearFilterBtn.addEventListener('click', clearFilter);
    dom.suggestBtn.addEventListener('click', suggestAdjacentRooms);
    dom.sortAscBtn.addEventListener('click', () => sortBookings('asc'));
    dom.sortDescBtn.addEventListener('click', () => sortBookings('desc'));
    dom.resetBtn.addEventListener('click', resetData);
    dom.customerId.addEventListener('input', updateDiscountPreview);
    dom.referredBy.addEventListener('input', updateDiscountPreview);
    // admin room events
    if(dom.adminAddRoom) dom.adminAddRoom.addEventListener('click', handleAdminAdd);
    if(dom.adminUpdateRoom) dom.adminUpdateRoom.addEventListener('click', handleAdminUpdate);
    if(dom.adminClearRoom) dom.adminClearRoom.addEventListener('click', clearAdminRoomForm);
    if(dom.roomsTableBody) dom.roomsTableBody.addEventListener('click', handleRoomsTableClick);
  }

  bindEvents();
  renderAll();
});
