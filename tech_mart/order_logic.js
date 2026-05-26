class Order {
    constructor(orderId, discountRate = 0) {
        this.orderId = orderId;
        this.items = [];
        this.discountRate = discountRate;
        this.taxRate = 0.1;
    }

    addItem(name, price, quantity) {
        if (!name || typeof name !== "string" || name.trim() === "") {
            throw new Error("Tên sản phẩm không hợp lệ");
        }
        if (typeof price !== "number" || Number.isNaN(price) || price < 0 || !isFinite(price)) {
            throw new Error("Giá sản phẩm phải là một số dương hợp lệ");
        }
        if (typeof quantity !== "number" || Number.isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
            throw new Error("Số lượng sản phẩm phải là số nguyên lớn hơn 0");
        }
        
        this.items.push({ name: name.trim(), price, quantity });
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getDiscountAmount() {
        return this.getSubtotal() * this.discountRate;
    }

    getTaxAmount() {
        const taxableAmount = this.getSubtotal() - this.getDiscountAmount();
        return taxableAmount * this.taxRate;
    }

    getFinalTotal() {
        const subtotal = this.getSubtotal();
        const discount = this.getDiscountAmount();
        const tax = this.getTaxAmount();
        return subtotal - discount + tax;
    }
}