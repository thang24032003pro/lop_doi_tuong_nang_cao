class ElectrucLamp{
    #status = false;
    
    turnOn(){
        this.#status = true;
        console.log("Bóng đèn :Đang sáng.");
    }
    
    turnOff(){
        this.#status = false;
        console.log("Bóng đèn :Đang tắt.");
    }
}

class SwitchButton{
    #status = false;
    #lamp = null;

    connectToLamp(lampObject){
    if (!lampObject || typeof lampObject.turnOn !== "function" || typeof lampObject.turnOff !== "function") {
            console.log("LỖI: Thiết bị kết nối không hợp lệ.");
            return;
        }
        this.#lamp = lampObject;
    }

    switchOn() {
        this.#status = true;
        console.log("Công tắc: Đã BẬT.");
        if (this.#lamp) {
            this.#lamp.turnOn();
        }
    }

    switchOff() {
        this.#status = false;
        console.log("Công tắc: Đã TẮT.");
        if (this.#lamp) {
            this.#lamp.turnOff();
        }
    }
}

let sofaLamp = new ElectricLamp();
let wallSwitch = new SwitchButton();

wallSwitch.connectToLamp(sofaLamp);

for (let i = 1; i <= 10; i++) {
    console.log("--- LẦN NHẤN THỨ " + i + " ---");
    if (i % 2 !== 0) {
        wallSwitch.switchOn();
    } else {
        wallSwitch.switchOff();
    }
    console.log("");
}