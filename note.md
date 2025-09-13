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
11. quản lý mượn trả sách: bổ sung search
12. kiểm tra lại borrowrecord -> đang k cho mượn sách (chập chờn)
13. đặt trước: bỏ tab tất cả, sắp hết hạn
  - tất cả các button khi ấn đều phải hiển thị popconfirm xác nhận