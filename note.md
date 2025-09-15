1. import excel bổ sung biểu mẫu (template cho người dùng tải về) -> oke
14. bổ sung thêm chức năng đổi mật khẩu -> oke
15. check lỗi phân quyền bên phía admin -> oke
15. check lỗi phân quyền bên phía customer
16. quyên mật khẩu bên admin -> oke
2. chỉnh lại các trường tên cột: /src/pages/users/components/user-table.tsx -> oke
3. làm lại phần edit user: Chỉnh sửa người dùng
4. chức năng add: chỉnh lại admin/nhân viên không cho điền các thông tin reader (giữ nguyên mã người dùng khi sync), trường k quan trọng set là null -> oke
5. nxb email là required, còn lại là optional -> oke
6. quản lý thể loại thiển thị thành expand, ẩn ngày tạo, đồng bộ ui -> oke
7. kệ sách ẩn ngày tạo -> oke
8. tên sách k phải là unique -> oke
9. ebook: đang không edit được -> oke
10. physical book: edit tất cả các trường -> oke
khi mượn sách, trạng thái phải là: "đã đặt mượn", không phải "đặt mượn"
11. quản lý mượn trả sách: bổ sung search -> oke
12. kiểm tra lại borrowrecord -> đang k cho mượn sách (chập chờn)
13. đặt trước: bỏ tab tất cả, sắp hết hạn -> oke
  - tất cả các button khi ấn đều phải hiển thị popconfirm xác nhận -> oke

14/09
1. borrow-records: gộp tab "đã gia hạn" + "đang mượn" thành 1
2. dashboard:
  + bỏ Chờ phê duyệt
  + bỏ sắp hết hạn
  tab book:
    chỉnh lại table Chi tiết theo thể loại theo dạng cha/con expand
  tab user:
    thống kế theo loại độc giả
3. reservations:
  chung 1 status: phần hết hạn -> Đã hủy
4. Phân bố theo thể loại -> thống kê chỉ theo parent id
5. Quản lý người dùng
- cả bên phía user cũng không cho điền các thông tin reader (giữ nguyên mã người dùng khi sync), trường k quan trọng set là null
- chỉnh lại logic excel (có lại bỏ mấy trường import lên, xem lại logic)
6. Chi tiết Sách Vật lý
  phần giá bỏ format lại giá
7. Thêm sách mới
  - bỏ phiên bản, thể loại, khối lớp
  - các trường không bắt buộc: số trang
8. Quản lý Đặt Trước
- confirm xác nhận bổ sung thêm note trước khi confirm -> done
9. Tạo phạt mới
- chỉnh format: mã độc giả - tên đọc giả
- lần mượn quá hạn: (optional)
- có trường note
10. tab quá hạn trong mượn trả -> bổ sung thêm button download pdf
11. bổ sung breadcrum bên route: http://localhost:3000/books
12. bổ sung count book cho từng danh mục