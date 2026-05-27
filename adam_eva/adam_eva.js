class Apple{
    #weight = 10;

    getWeight(){
        return this.#weight;
    }

    decrease(){
        if(this.#weight > 0){
            this.#weight--;
            return true;
        }
        return false;
    }

    isEmpty(){
        return this.#weight ===0;
    }
}

class Human {
    #name;
    #gender;
    #weight;

    constructor(name,gender,weight){
        this.#name = name;
        this.#gender = gender;
        this.#weight = weight;
    }

    getName(){
        return this.#name;
    }

    getGender(){
        return this.#gender;
    }

    getWeight() {
        return this.#weight;
    }

    say(words){
        console.log(this.#name + "nói: \""+ words + "\"");
    }
checkApple(apple) {
        return apple.getWeight();
    }

    eat(apple) {
        if (apple.isEmpty()) {
            this.say("Táo đã hết rồi, không ăn được nữa.");
            return false;
        }
        
        if (apple.decrease()) {
            this.#weight++;
            console.log(this.#name + " đã ăn 1 miếng táo. Cân nặng hiện tại: " + this.#weight);
            return true;
        }
        return false;
    }
}

let centralApple = new Apple();
let adam = new Human("Adam", "Nam", 70);
let eva = new Human("Eva", "Nữ", 50);

adam.say("Chào Eva, anh thấy một quả táo rất ngon!");
eva.say("Chào Adam, chúng ta cùng ăn thử xem sao.");

console.log("--- BẮT ĐẦU ĂN TÁO ---");
while (!centralApple.isEmpty()) {
    adam.eat(centralApple);
    console.log("Khối lượng táo còn lại: " + adam.checkApple(centralApple) + "\n");
    
    if (!centralApple.isEmpty()) {
        eva.eat(centralApple);
        console.log("Khối lượng táo còn lại: " + eva.checkApple(centralApple) + "\n");
    }
}

console.log("--- TRẠNG THÁI CUỐI CÙNG ---");
console.log("Cân nặng cuối cùng của " + adam.getName() + " (" + adam.getGender() + "): " + adam.getWeight());
console.log("Cân nặng cuối cùng của " + eva.getName() + " (" + eva.getGender() + "): " + eva.getWeight());
adam.eat(centralApple);