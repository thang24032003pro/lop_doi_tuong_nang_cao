class Battery {
    constructor() {
        this.energy = 0; // Trạng thái năng lượng ban đầu
    }

    // Thiết lập mức năng lượng cho pin
    setEnergy(energy) {
        if (typeof energy !== "number" || energy < 0) {
            console.log("Mức năng lượng nạp vào không hợp lệ!");
            return;
        }
        this.energy = energy;
    }

    // Lấy ra mức năng lượng hiện tại
    getEnergy() {
        return this.energy;
    }

    // Phương thức giảm năng lượng khi đèn tiêu thụ
    decreaseEnergy() {
        if (this.energy > 0) {
            this.energy--;
        }
    }
}

// --- BƯỚC 2: KHAI BÁO LỚP FLASHLAMP (ĐÈN PIN) ---
class FlashLamp {
    constructor() {
        this.status = false; // Trạng thái đèn: false (Tắt), true (Bật)
        this.battery = null; // Đèn chưa được lắp pin khi mới khởi tạo
    }

    // Gắn một đối tượng pin vào đèn
    setBattery(battery) {
        this.battery = battery;
    }

    // Lấy ra thông tin năng lượng của pin đang lắp trong đèn
    getBatteryInfo() {
        if (this.battery) {
            return this.battery.getEnergy();
        } else {
            console.log("Đèn chưa được lắp pin!");
            return 0;
        }
    }

    // Bật đèn
    turnOn() {
        this.status = true;
        console.log("Đèn đã bật (Lighting).");
        
        // Khi bật đèn, nếu có pin thì sẽ tiêu hao năng lượng
        if (this.battery && this.battery.getEnergy() > 0) {
            this.battery.decreaseEnergy();
        } else {
            console.log("Đèn không sáng do hết pin hoặc chưa lắp pin!");
        }
    }

    // Tắt đèn
    turnOff() {
        this.status = false;
        console.log("Đèn đã tắt.");
    }
}

// --- BƯỚC 3: KỊCH BẢN THỬ NGHIỆM VẬN HÀNH ---

// 1. Tạo một đối tượng pin và nạp năng lượng là 10
let battery = new Battery();
battery.setEnergy(10);

// 2. Tạo một đối tượng đèn pin
let flashLamp = new FlashLamp();


flashLamp.setBattery(battery);

console.log(`Năng lượng của pin trong đèn hiện tại: ${flashLamp.getBatteryInfo()}`);

flashLamp.turnOn();
console.log(`Năng lượng sau khi bật: ${flashLamp.getBatteryInfo()}`);

flashLamp.turnOff();

// 6. Bật đèn lần 2
flashLamp.turnOn();
console.log(`Năng lượng sau khi bật lần 2: ${flashLamp.getBatteryInfo()}`);