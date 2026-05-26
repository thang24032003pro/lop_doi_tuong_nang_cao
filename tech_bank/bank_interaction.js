class BankAccount {
    constructor(id, name, balance) {
        this.id = id;
        this.name = name;
        this.balance = balance;
    }

    deposit(amount) {
        if (amount <= 0) {
            return false;
        }
        this.balance += amount;
        return true;
    }

    withdraw(amount) {
        if (amount <= 0 || this.balance < amount) {
            return false;
        }
        this.balance -= amount;
        return true;
    }

    transferTo(targetAccount, amount) {
        if (amount <= 0) {
            return "GIAO DỊCH THẤT BẠI: SỐ TIỀN PHẢI LỚN HƠN 0";
        }
        if (this === targetAccount) {
            return "GIAO DỊCH THẤT BẠI: KHÔNG THỂ TỰ CHUYỂN TIỀN CHO CHÍNH MÌNH";
        }
        if (!(targetAccount instanceof BankAccount)) {
            return "GIAO DỊCH THẤT BẠI: TÀI KHOẢN ĐÍCH KHÔNG HỢP LỆ";
        }
        if (this.balance < amount) {
            return "GIAO DỊCH THẤT BẠI: SỐ DƯ TÀI KHOẢN KHÔNG ĐỦ";
        }

        this.withdraw(amount);
        const isDeposited = targetAccount.deposit(amount);

        if (!isDeposited) {
            this.deposit(amount);
            return "GIAO DỊCH THẤT BẠI: LỖI HỆ THỐNG ĐÍCH - ĐÃ HOÀN TIỀN";
        }

        return "GIAO DỊCH THÀNH CÔNG";
    }
}

const alice = new BankAccount("A01", "Alice", 5000);
const bob = new BankAccount("A02", "Bob", 1000);
const charlie = new BankAccount("A03", "Charlie", 2000);

const initialTotal = alice.balance + bob.balance + charlie.balance;
console.log("=== TRẠNG THÁI BAN ĐẦU ===");
console.log(`Alice: ${alice.balance} | Bob: ${bob.balance} | Charlie: ${charlie.balance}`);
console.log(`TỔNG TIỀN HỆ THỐNG: ${initialTotal}\n`);

console.log("=== LỊCH SỬ GIAO DỊCH HỢP LỆ ===");

let res1 = alice.transferTo(bob, 2000);
console.log(`Alice chuyển 2000 cho Bob: ${res1}`);
console.log(`-> Số dư Alice: ${alice.balance} | Bob: ${bob.balance}`);

let res2 = bob.transferTo(charlie, 1500);
console.log(`Bob chuyển 1500 cho Charlie: ${res2}`);
console.log(`-> Số dư Bob: ${bob.balance} | Charlie: ${charlie.balance}`);

let res3 = charlie.transferTo(alice, 500);
console.log(`Charlie chuyển 500 cho Alice: ${res3}`);
console.log(`-> Số dư Charlie: ${charlie.balance} | Alice: ${alice.balance}\n`);

console.log("=== KIỂM THỬ KỊCH BẢN LỖI (EDGE CASES) ===");

let err1 = alice.transferTo(alice, 1000);
console.log(`Alice tự chuyển cho chính mình 1000: ${err1}`);

let err2 = alice.transferTo(bob, -500);
console.log(`Alice chuyển số tiền âm (-500) cho Bob: ${err2}`);

let err3 = bob.transferTo(charlie, 10000);
console.log(`Bob cố tình chuyển quá số dư (10000): ${err3}`);

let err4 = alice.transferTo("Charlie", 500);
console.log(`Alice chuyển tiền vào một chuỗi văn bản 'Charlie': ${err4}\n`);

const finalTotal = alice.balance + bob.balance + charlie.balance;
console.log("=== TRẠNG THÁI CUỐI CÙNG ===");
console.log(`Alice: ${alice.balance} | Bob: ${bob.balance} | Charlie: ${charlie.balance}`);
console.log(`TỔNG TIỀN HỆ THỐNG: ${finalTotal}`);
console.log(`XÁC MINH DÒNG TIỀN BẢO TOÀN: ${initialTotal === finalTotal ? "HỢP LỆ" : "THẤT THOÁT"}`);