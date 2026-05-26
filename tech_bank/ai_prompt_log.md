Prompt 1: Trong Lập trình Hướng đối tượng, thay vì sửa trực tiếp thuộc tính của một object khác, tại sao các object nên tương tác với nhau thông qua việc gọi các Method (Message Passing)? Cho tôi một ví dụ đời thực giữa Người mua và Thu ngân.

Prompt 2: Tôi dự định viết logic cho hàm transferTo(target, amount) như sau: 1. Trừ tiền mình (this.withdraw). 2. Cộng tiền cho target (target.deposit). Có trường hợp nào bước 1 thành công nhưng bước 2 thất bại khiến tiền bốc hơi không? Làm sao để roll-back (hoàn tiền)?

Prompt 3: Khi tôi gọi alice.transferTo("Bob", 500), code báo lỗi 'targetAccount.deposit is not a function'. Tại sao tôi truyền chữ 'Bob' vào lại sai, trong khi đối tượng receiver tên là Bob?

Prompt 4: Hãy đóng vai một Tester ngân hàng. Đưa ra 4 kịch bản giao dịch (Edge cases) dị thường liên quan đến tương tác đối tượng để cố tình làm hỏng hàm transferTo của tôi (Ví dụ: Alice tự chuyển tiền cho chính Alice).