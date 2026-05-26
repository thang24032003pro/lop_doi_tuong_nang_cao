class LegacyWallet {
    constructor(ownerName, initialBalance) {
        this.ownerName = ownerName;
        this.balance = initialBalance;   
    }

    deposit(amount) {
        this.balance += amount;
    }
}

let myWallet = new LegacyWallet("Nguyen Van A", 50000);

// --- HACKER TẤN CÔNG ---
console.log("Số dư ban đầu:", myWallet.balance);

// Hacker 1: Sửa trực tiếp số dư mà không cần gọi hàm deposit()
myWallet.balance = 999999999;
console.log("Hacker 1 hack tiền:", myWallet.balance);

// Hacker 2: Gán số dư thành kiểu dữ liệu sai (Gây sập hệ thống toán học)
myWallet.balance = "Ba tỷ đồng"; 
console.log("Hacker 2 phá hoại data:", myWallet.balance);