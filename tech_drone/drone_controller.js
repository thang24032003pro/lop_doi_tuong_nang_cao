class SecureDrone {
    #altitude = 0;
    #battery = 100;

    constructor(id) {
        this.id = id;
    }

    getStatus() {
        return {
            id: this.id,
            altitude: this.#altitude,
            battery: this.#battery
        };
    }

    flyUp(meters) {
        if (typeof meters !== 'number' || meters <= 0 || Number.isNaN(meters)) {
            console.log("LỖI: Tham số mét bay lên không hợp lệ.");
            return false;
        }
        if (this.#battery <= 0) {
            console.log("LỖI: Không thể cất cánh, drone đã hết pin.");
            return false;
        }
        let batteryCost = meters * 0.5;
        if (this.#battery - batteryCost < 0) {
            console.log("LỖI: Không đủ pin để hoàn thành độ cao này.");
            return false;
        }
        let targetAltitude = this.#altitude + meters;
        if (targetAltitude > 120) {
            console.log("LỖI: Vượt quá trần bay an toàn 120m.");
            return false;
        }
        this.#altitude = targetAltitude;
        this.#battery -= batteryCost;
        return true;
    }

    flyDown(meters) {
        if (typeof meters !== 'number' || meters <= 0 || Number.isNaN(meters)) {
            console.log("LỖI: Tham số mét hạ cánh không hợp lệ.");
            return false;
        }
        let targetAltitude = this.#altitude - meters;
        if (targetAltitude < 0) {
            console.log("LỖI: Độ cao không thể âm.");
            return false;
        }
        this.#altitude = targetAltitude;
        return true;
    }
}