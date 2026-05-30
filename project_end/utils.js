const STORAGE_KEY = 'luxestay_oop_state_v2';

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(Number(amount) || 0);
}

function deepClone(data) {
  return JSON.parse(JSON.stringify(data));
}

function calculateReferralPoints(customerId, allCustomers) {
  const customer = allCustomers.find(item => item.id === customerId);
  if (!customer || customer.referredBy === null) return 0;
  return 10 + calculateReferralPoints(customer.referredBy, allCustomers);
}

function createDefaultRoomsMatrix() {
  const floorPlans = [
    [
      { type: 'Standard', price: 1200000 },
      { type: 'Standard', price: 1350000 },
      { type: 'VIP', price: 2200000 },
      { type: 'VIP', price: 2500000 },
      { type: 'President', price: 4200000 }
    ],
    [
      { type: 'Standard', price: 1450000 },
      { type: 'Standard', price: 1550000 },
      { type: 'VIP', price: 2600000 },
      { type: 'VIP', price: 2850000 },
      { type: 'President', price: 4800000 }
    ],
    [
      { type: 'Standard', price: 1650000 },
      { type: 'Standard', price: 1750000 },
      { type: 'VIP', price: 3100000 },
      { type: 'VIP', price: 3350000 },
      { type: 'President', price: 5600000 }
    ]
  ];

  return floorPlans.map((floorRooms, floorIndex) => {
    const floorNumber = floorIndex + 1;
    return floorRooms.map((roomData, roomIndex) => {
      const roomId = `${floorNumber}${String(roomIndex + 1).padStart(2, '0')}`;
      return new Room(roomId, roomData.type, floorNumber, roomData.price);
    });
  });
}

function createDefaultCustomers() {
  return [
    new Customer('C001', 'Nguyễn Minh Anh', '0901000001', null),
    new Customer('C002', 'Trần Quốc Bảo', '0901000002', 'C001'),
    new Customer('C003', 'Lê Thanh Chi', '0901000003', 'C002'),
    new Customer('C004', 'Phạm Hoàng Dũng', '0901000004', null),
    new Customer('C005', 'Võ Hà Linh', '0901000005', 'C003'),
    new Customer('C006', 'Đỗ Hải Nam', '0901000006', 'C005'),
    new Customer('C007', 'Bùi Gia Hân', '0901000007', 'C001'),
    new Customer('C008', 'Hoàng Tuấn Kiệt', '0901000008', 'C007')
    
  ];
}

function createSeedSystem() {
  const system = new BookingSystem(createDefaultRoomsMatrix(), [], createDefaultCustomers());
  const samples = [
    { customer: new Customer('C003', 'Lê Thanh Chi', '0901000003', 'C002'), roomId: '103', discount: 0.05 },
    { customer: new Customer('C004', 'Phạm Hoàng Dũng', '0901000004', null), roomId: '205', discount: 0 },
    { customer: new Customer('C005', 'Võ Hà Linh', '0901000005', 'C003'), roomId: '304', discount: 0.05 },
    { customer: new Customer('C006', 'Đỗ Hải Nam', '0901000006', 'C005'), roomId: '105', discount: 0.05 },
    { customer: new Customer('C007', 'Bùi Gia Hân', '0901000007', 'C001'), roomId: '202', discount: 0 },
    { customer: new Customer('C008', 'Hoàng Tuấn Kiệt', '0901000008', 'C007'), roomId: '303', discount: 0.05 }
  ];

  samples.forEach(item => {
    try {
      system.createBooking(item.customer, item.roomId, item.discount);
    } catch (error) {}
  });

  return system;
}

function saveData(system) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(system.toJSON()));
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createSeedSystem();

  try {
    return BookingSystem.fromJSON(JSON.parse(raw));
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return createSeedSystem();
  }
}
