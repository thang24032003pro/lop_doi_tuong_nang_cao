class Room {
  #isBooked = false;
  #basePrice = 0;

  constructor(id, type, floor, basePrice, isBooked = false) {
    this.id = String(id || 'UNKNOWN');
    this.type = String(type || 'Standard');
    this.floor = Number(floor) || 1;
    this.basePrice = basePrice ?? 0;
    this.#isBooked = Boolean(isBooked);
  }

  get isBooked() {
    return this.#isBooked;
  }

  get basePrice() {
    return this.#basePrice;
  }

  set basePrice(value) {
    const price = Number(value);
    if (Number.isNaN(price) || price < 0) {
      throw new Error('Giá phòng không được âm.');
    }
    this.#basePrice = price;
  }

  book() {
    if (this.#isBooked) {
      throw new Error(`Phòng ${this.id} đã được đặt.`);
    }
    this.#isBooked = true;
    return true;
  }

  cancel() {
    if (!this.#isBooked) return false;
    this.#isBooked = false;
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      floor: this.floor,
      basePrice: this.#basePrice,
      isBooked: this.#isBooked
    };
  }

  static fromJSON(data) {
    return new Room(data.id, data.type, data.floor, data.basePrice, data.isBooked);
  }
}

class Customer {
  constructor(id, name, phone, referredBy = null) {
    this.id = String(id || '').trim();
    this.name = String(name || '').trim();
    this.phone = String(phone || '').trim();
    this.referredBy = referredBy ? String(referredBy).trim() : null;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      referredBy: this.referredBy
    };
  }

  static fromJSON(data) {
    return new Customer(data.id, data.name, data.phone, data.referredBy);
  }
}

class Booking {
  constructor(id, customer, roomSnapshot, originalPrice, discountPercent = 0, createdAt = new Date().toLocaleString('vi-VN')) {
    this.id = id || `BK-${Date.now()}`;
    this.customer = customer;
    this.roomSnapshot = roomSnapshot;
    this.originalPrice = Number(originalPrice) || 0;
    this.discountPercent = Number(discountPercent) || 0;
    this.totalPrice = Math.round(this.originalPrice * (1 - this.discountPercent));
    this.createdAt = createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      customer: this.customer.toJSON ? this.customer.toJSON() : this.customer,
      roomSnapshot: this.roomSnapshot,
      originalPrice: this.originalPrice,
      discountPercent: this.discountPercent,
      totalPrice: this.totalPrice,
      createdAt: this.createdAt
    };
  }

  static fromJSON(data) {
    return new Booking(
      data.id,
      Customer.fromJSON(data.customer),
      data.roomSnapshot,
      data.originalPrice,
      data.discountPercent,
      data.createdAt
    );
  }
}

class BookingSystem {
  #roomsMatrix = [];
  #bookingHistory = [];
  #customers = [];

  constructor(roomsMatrix = [], bookingHistory = [], customers = []) {
    this.#roomsMatrix = roomsMatrix;
    this.#bookingHistory = bookingHistory;
    this.#customers = customers;
  }

  get roomsMatrix() {
    return this.#roomsMatrix;
  }

  get bookingHistory() {
    return [...this.#bookingHistory];
  }

  get customers() {
    return [...this.#customers];
  }

  findRoom(roomId) {
    return this.#roomsMatrix.flat().find(room => room.id === String(roomId)) || null;
  }

  findCustomer(customerId) {
    return this.#customers.find(customer => customer.id === String(customerId).trim()) || null;
  }

  upsertCustomer(customer) {
    const index = this.#customers.findIndex(item => item.id === customer.id);
    if (index >= 0) this.#customers[index] = customer;
    else this.#customers.push(customer);
  }

  createBooking(customer, roomId, discountPercent = 0) {
    const room = this.findRoom(roomId);
    if (!room) throw new Error('Không tìm thấy phòng đã chọn.');

    room.book();
    this.upsertCustomer(customer);

    const roomSnapshot = deepClone(room.toJSON());
    const customerSnapshot = Customer.fromJSON(deepClone(customer.toJSON()));
    const booking = new Booking(`BK-${Date.now()}`, customerSnapshot, roomSnapshot, room.basePrice, discountPercent);
    this.#bookingHistory.push(Booking.fromJSON(deepClone(booking.toJSON())));

    return booking;
  }

  getAvailableRooms(type = 'all', maxPrice = Infinity) {
    return this.#roomsMatrix
      .flat()
      .filter(room => !room.isBooked)
      .filter(room => type === 'all' || room.type === type)
      .filter(room => room.basePrice <= maxPrice);
  }

  suggestAdjacentRooms(quantity) {
    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error('Số lượng phòng phải là số nguyên lớn hơn 0.');
    }

    const maxRoomsPerFloor = Math.max(...this.#roomsMatrix.map(floor => floor.length));
    if (amount > maxRoomsPerFloor) {
      throw new Error('Số lượng yêu cầu lớn hơn số phòng trên một tầng.');
    }

    for (const floorRooms of this.#roomsMatrix) {
      for (let start = 0; start <= floorRooms.length - amount; start++) {
        const group = floorRooms.slice(start, start + amount);
        if (group.every(room => !room.isBooked)) return group;
      }
    }

    return null;
  }

  getAdminReport() {
    return {
      highValueBookings: this.#bookingHistory.filter(booking => booking.totalPrice > 2000000),
      totalRevenue: this.#bookingHistory.reduce((sum, booking) => sum + booking.totalPrice, 0),
      customerNames: this.#bookingHistory.map(booking => booking.customer.name)
    };
  }

  getRevenueByRoomType() {
    return this.#bookingHistory.reduce((result, booking) => {
      const type = booking.roomSnapshot.type;
      result[type] = (result[type] || 0) + booking.totalPrice;
      return result;
    }, { Standard: 0, VIP: 0, President: 0 });
  }

  // Admin CRUD for rooms
  addRoom(floorIndex, room) {
    // floorIndex is 0-based
    if (!room || !(room instanceof Room)) throw new Error('Invalid room instance');
    const floor = this.#roomsMatrix[floorIndex];
    if (!floor) throw new Error('Floor không tồn tại');
    // prevent duplicate id
    if (this.findRoom(room.id)) throw new Error('Mã phòng đã tồn tại');
    floor.push(room);
    return true;
  }

  updateRoom(roomId, updates = {}) {
    const room = this.findRoom(roomId);
    if (!room) throw new Error('Phòng không tìm thấy');
    // cannot change id directly
    if (updates.type !== undefined) room.type = updates.type;
    if (updates.floor !== undefined) room.floor = Number(updates.floor) || room.floor;
    if (updates.basePrice !== undefined) room.basePrice = updates.basePrice;
    return true;
  }

  deleteRoom(roomId) {
    for (let i = 0; i < this.#roomsMatrix.length; i++) {
      const floor = this.#roomsMatrix[i];
      const idx = floor.findIndex(r => r.id === roomId);
      if (idx !== -1) {
        if (floor[idx].isBooked) throw new Error('Không thể xóa phòng đã được đặt');
        floor.splice(idx, 1);
        return true;
      }
    }
    throw new Error('Phòng không tìm thấy');
  }

  sortBookingsByTotal(direction = 'asc') {
    return [...this.#bookingHistory].sort((a, b) => {
      return direction === 'asc' ? a.totalPrice - b.totalPrice : b.totalPrice - a.totalPrice;
    });
  }

  toJSON() {
    return {
      roomsMatrix: this.#roomsMatrix.map(floor => floor.map(room => room.toJSON())),
      bookingHistory: this.#bookingHistory.map(booking => booking.toJSON()),
      customers: this.#customers.map(customer => customer.toJSON())
    };
  }

  static fromJSON(data) {
    const roomsMatrix = (data.roomsMatrix || []).map(floor => floor.map(room => Room.fromJSON(room)));
    const bookingHistory = (data.bookingHistory || []).map(booking => Booking.fromJSON(booking));
    const customers = (data.customers || []).map(customer => Customer.fromJSON(customer));
    return new BookingSystem(roomsMatrix, bookingHistory, customers);
  }
}
