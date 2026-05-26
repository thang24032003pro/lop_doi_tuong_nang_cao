/**
 * LÕI THANH TOÁN TECHWALLET (LEGACY CODE)
 * LỖI NGHIÊM TRỌNG: Dữ liệu bị phơi bày (Lack of Encapsulation)
 */

class LegacyWallet {
    constructor(ownerName, initialBalance) {
        this.ownerName = ownerName;
        this.balance = initialBalance; // LỖI: Thuộc tính public, ai cũng có thể sửa
    }

    // Các hàm giao dịch vô tác dụng vì người ta có thể sửa balance trực tiếp
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