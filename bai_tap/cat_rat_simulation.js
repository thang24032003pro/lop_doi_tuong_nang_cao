class Rat {
    constructor(name, weight, speed) {
        this.name = name;
        this.weight = weight;
        this.speed = speed;
        this.status = "sống";
    }

    speak() {
        console.log(`${this.name} kêu: Chít chít!`);
    }
}

class Cat {
    constructor(name, weight, maxSpeed) {
        this.name = name;
        this.weight = weight;
        this.maxSpeed = maxSpeed;
    }

    speak() {
        console.log(`${this.name} kêu: Meo meo!`);
    }

    catchRat(rat) {
        if (this.maxSpeed > rat.speed) {
            console.log(`${this.name} ĐÃ BẮT ĐƯỢC chuột ${rat.name}!`);
            return true;
        }
        console.log(`${this.name} THẤT BẠI khi đuổi theo chuột ${rat.name} (Mèo: ${this.maxSpeed} < Chuột: ${rat.speed})`);
        return false;
    }

    eatRat(rat) {
        if (rat.status === "sống") {
            this.weight += rat.weight;
            rat.status = "chết";
            console.log(`${this.name} đã ăn chuột ${rat.name}. Khối lượng mèo tăng lên: ${this.weight}`);
        } else {
            console.log(`${this.name} từ chối ăn chuột ${rat.name} vì chuột không còn sống!`);
        }
    }
}

const tom = new Cat("Tom", 15, 50);
const jerry = new Rat("Jerry", 3, 30);
const mickey = new Rat("Mickey", 4, 60);
const ratDead = new Rat("Chuột Thối", 2, 10);
ratDead.status = "chết";

console.log("=== BẮT ĐẦU MÔ PHỎNG ===");
tom.speak();
jerry.speak();

console.log("\n--- Kịch bản 1: Chuột chạy nhanh hơn mèo ---");
let check1 = tom.catchRat(mickey);
if (check1) {
    tom.eatRat(mickey);
}

console.log("\n--- Kịch bản 2: Mèo chạy nhanh hơn và ăn chuột ---");
let check2 = tom.catchRat(jerry);
if (check2) {
    tom.eatRat(jerry);
}

console.log("\n--- Kịch bản 3: Mèo bắt được chuột đã chết trước đó ---");
let check3 = tom.catchRat(ratDead);
if (check3) {
    tom.eatRat(ratDead);
}