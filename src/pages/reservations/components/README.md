# Reservation Components

## FulfillConfirmDialog

Dialog xác nhận thực hiện đặt trước với khả năng nhập ghi chú tùy chọn.

### Features

- **Textarea cho ghi chú**: Người dùng có thể nhập ghi chú tùy chọn khi thực hiện đặt trước
- **Ghi chú mặc định**: Nếu không nhập ghi chú, hệ thống sẽ sử dụng ghi chú mặc định
- **Đếm ký tự**: Hiển thị số ký tự đã nhập (tối đa 500 ký tự)
- **Reset state**: Tự động reset ghi chú khi đóng dialog
- **Loading state**: Disable textarea khi đang xử lý

### Props

```typescript
interface FulfillConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation | null;
  onConfirm: (notes?: string) => void; // Nhận ghi chú từ người dùng
  onCancel?: () => void;
  isLoading?: boolean;
}
```

### Usage

```tsx
<FulfillConfirmDialog
  open={fulfillDialogOpen}
  onOpenChange={setFulfillDialogOpen}
  reservation={selectedReservation}
  onConfirm={(notes) => handleFulfillReservation(reservationId, notes)}
  onCancel={handleCancelDialog}
  isLoading={isFulfillPending}
/>
```

### Behavior

1. **Khi mở dialog**: Textarea trống, sẵn sàng cho người dùng nhập ghi chú
2. **Khi nhập ghi chú**: Hiển thị đếm ký tự và placeholder
3. **Khi xác nhận**:
   - Nếu có ghi chú: Truyền ghi chú người dùng nhập
   - Nếu không có ghi chú: Truyền ghi chú mặc định "Đặt trước được thực hiện - Không có ghi chú"
4. **Khi hủy**: Reset textarea về trạng thái ban đầu
5. **Khi đóng dialog**: Tự động reset state

### Integration với Borrow Record

Ghi chú từ dialog sẽ được sử dụng trong:

- **Borrow Record**: `borrow_notes` field
- **Reservation Fulfillment**: `notes` field trong API call
- **Physical Copy Update**: `notes` field khi cập nhật trạng thái

### Example Flow

1. User clicks "Thực hiện" button
2. Dialog mở với textarea trống
3. User nhập ghi chú: "Sách được giao tận nơi"
4. User clicks "Xác nhận thực hiện"
5. `onConfirm("Sách được giao tận nơi")` được gọi
6. Ghi chú được sử dụng trong tất cả các API calls
7. Dialog đóng và reset state
