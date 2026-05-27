class SmartLight {
    constructor(id){
        this.id = id;
        this.isOn = false;
    }
    turnOn(){
        this.isOn =  true;
        console.log("Đèn" + this.id + "đã BẬT");
    }
    turnOff(){
        this.isOn = false;
        console.log("Đèn" + this.id + "đã Tắt")
    }

}
class MotionSensor{
    constructor(id){
        this.id = id;
        this.linkedDevice = null;
    }
    connectDevice(deviceObject){
        if (!deviceObject || typeof deviceObject.turnOn !== "function" || typeof deviceObject.turnOff !== "function") {
            console.log("LỖI: Thiết bị kết nối không hợp lệ hoặc không hỗ trợ chức năng.");
            return;
        }
        this.linkedDevice = deviceObject;
        console.log("Cảm biến " + this.id + " đã kết nối tới thiết bị " + deviceObject.id);
    }

    disconnectDevice() {
        this.linkedDevice = null;
        console.log("Cảm biến " + this.id + " đã ngắt toàn bộ kết nối.");
    }

    trigger() {
        console.log("Cảm biến " + this.id + " phát hiện có chuyển động!");
        if (!this.linkedDevice) {
            console.log("CẢNH BÁO: Cảm biến chưa được liên kết với thiết bị nào.");
            return;
        }
        this.linkedDevice.turnOn();
    }
}

let light1 = new SmartLight("L01");
let light2 = new SmartLight("L02");
let sensor1 = new MotionSensor("S01");

sensor1.trigger();

sensor1.connectDevice(light1);
sensor1.trigger();

sensor1.connectDevice(light2);
sensor1.trigger();

sensor1.disconnectDevice();
sensor1.trigger();

sensor1.connectDevice({ name: "FakeDevice" });