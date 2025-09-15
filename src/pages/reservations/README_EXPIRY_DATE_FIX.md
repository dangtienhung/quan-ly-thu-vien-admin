# Expiry Date Logic Fix - End of Day Comparison

## Vấn đề

Trước đây, logic kiểm tra hết hạn đặt trước sử dụng so sánh trực tiếp:
```typescript
new Date(reservation.expiry_date) < new Date()
```

Điều này gây ra vấn đề:
- **So sánh cả giờ phút giây**: Chưa đến cuối ngày hết hạn đã bị chuyển trạng thái
- **Không chính xác**: Đặt trước hết hạn lúc 23:59 nhưng bị chuyển trạng thái lúc 09:00
- **UX không tốt**: Người dùng bối rối khi thấy button thay đổi sớm

## Giải pháp

Tạo utility functions để so sánh chỉ đến cuối ngày:

### **1. isExpiredByEndOfDay()**

```typescript
export const isExpiredByEndOfDay = (expiryDate: string): boolean => {
  const expiry = new Date(expiryDate);
  const today = new Date();

  // Set time to end of day for expiry date (23:59:59.999)
  expiry.setHours(23, 59, 59, 999);

  // Set time to start of day for today (00:00:00.000)
  today.setHours(0, 0, 0, 0);

  // So sánh: nếu hôm nay > ngày hết hạn (cuối ngày) thì đã quá hạn
  return today > expiry;
};
```

**Logic:**
- **Expiry date**: Set về cuối ngày (23:59:59.999)
- **Today**: Set về đầu ngày (00:00:00.000)
- **So sánh**: Chỉ khi sang ngày mới mới coi là quá hạn

### **2. isExpiringSoon()**

```typescript
export const isExpiringSoon = (expiryDate: string, daysThreshold: number = 3): boolean => {
  const expiry = new Date(expiryDate);
  const today = new Date();

  // Set time to end of day for expiry date
  expiry.setHours(23, 59, 59, 999);

  // Set time to start of day for today
  today.setHours(0, 0, 0, 0);

  // Tính số ngày còn lại
  const timeDiff = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // Sắp hết hạn nếu còn <= daysThreshold ngày và chưa quá hạn
  return daysRemaining <= daysThreshold && daysRemaining >= 0;
};
```

## Các file đã cập nhật

### **1. utils/borrow-utils.ts**
- Thêm `isExpiredByEndOfDay()`
- Thêm `isExpiringSoon()`

### **2. pages/reservations/page.tsx**
```typescript
// Trước
new Date(reservation.expiry_date) < new Date()

// Sau
isExpiredByEndOfDay(reservation.expiry_date)
```

### **3. components/ReservationTable.tsx**
```typescript
// Trước
{new Date(reservation.expiry_date) < new Date() ? (

// Sau
{isExpiredByEndOfDay(reservation.expiry_date) ? (
```

### **4. components/ExpireConfirmDialog.tsx**
```typescript
// Trước
const isExpired = new Date(reservation.expiry_date) < new Date();

// Sau
const isExpired = isExpiredByEndOfDay(reservation.expiry_date);
```

### **5. components/ExpiringSoonTable.tsx**
```typescript
// Cập nhật calculateDaysUntilExpiry để sử dụng logic end-of-day
const calculateDaysUntilExpiry = (expiryDate: string) => {
  const expiry = new Date(expiryDate);
  const today = new Date();

  // Set time to end of day for expiry date
  expiry.setHours(23, 59, 59, 999);

  // Set time to start of day for today
  today.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};
```

## Test Cases

### **isExpiredByEndOfDay()**

```typescript
describe('isExpiredByEndOfDay', () => {
  it('should return false if expiry date is today', () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const result = isExpiredByEndOfDay(todayString);
    expect(result).toBe(false);
  });

  it('should return true if expiry date is yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    const result = isExpiredByEndOfDay(yesterdayString);
    expect(result).toBe(true);
  });

  it('should return false if expiry date is tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    const result = isExpiredByEndOfDay(tomorrowString);
    expect(result).toBe(false);
  });
});
```

### **isExpiringSoon()**

```typescript
describe('isExpiringSoon', () => {
  it('should return true if expiry date is within 3 days', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    const result = isExpiringSoon(tomorrowString, 3);
    expect(result).toBe(true);
  });

  it('should return false if expiry date is more than 3 days away', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const futureString = future.toISOString().split('T')[0];

    const result = isExpiringSoon(futureString, 3);
    expect(result).toBe(false);
  });
});
```

## Ví dụ thực tế

### **Trước (Logic cũ)**

```
Ngày hết hạn: 2024-01-15 23:59:59
Hôm nay: 2024-01-15 09:00:00

So sánh: 2024-01-15 23:59:59 < 2024-01-15 09:00:00 = false
Kết quả: Chưa hết hạn (đúng)

Hôm nay: 2024-01-15 10:00:00
So sánh: 2024-01-15 23:59:59 < 2024-01-15 10:00:00 = false
Kết quả: Chưa hết hạn (đúng)

Hôm nay: 2024-01-16 00:01:00
So sánh: 2024-01-15 23:59:59 < 2024-01-16 00:01:00 = true
Kết quả: Đã hết hạn (đúng)
```

### **Sau (Logic mới)**

```
Ngày hết hạn: 2024-01-15 23:59:59
Hôm nay: 2024-01-15 09:00:00

Expiry: 2024-01-15 23:59:59.999
Today: 2024-01-15 00:00:00.000
So sánh: 2024-01-15 00:00:00.000 > 2024-01-15 23:59:59.999 = false
Kết quả: Chưa hết hạn (đúng)

Hôm nay: 2024-01-15 23:59:59
Expiry: 2024-01-15 23:59:59.999
Today: 2024-01-15 00:00:00.000
So sánh: 2024-01-15 00:00:00.000 > 2024-01-15 23:59:59.999 = false
Kết quả: Chưa hết hạn (đúng)

Hôm nay: 2024-01-16 00:00:00
Expiry: 2024-01-15 23:59:59.999
Today: 2024-01-16 00:00:00.000
So sánh: 2024-01-16 00:00:00.000 > 2024-01-15 23:59:59.999 = true
Kết quả: Đã hết hạn (đúng)
```

## Lợi ích

### **1. Chính xác hơn**
- Chỉ khi sang ngày mới mới coi là quá hạn
- Không bị ảnh hưởng bởi giờ phút giây

### **2. UX tốt hơn**
- Button không thay đổi sớm
- Người dùng có đủ thời gian trong ngày hết hạn

### **3. Consistent**
- Tất cả logic so sánh ngày đều sử dụng cùng một cách
- Dễ maintain và debug

### **4. Flexible**
- Có thể tùy chỉnh threshold cho "sắp hết hạn"
- Có thể mở rộng cho các trường hợp khác

## Backward Compatibility

- **API Response**: Không thay đổi
- **Database**: Không thay đổi
- **User Interface**: Cải thiện (chính xác hơn)
- **Business Logic**: Cải thiện (đúng hơn)

## Kết luận

Thay đổi này giải quyết vấn đề so sánh ngày không chính xác, đảm bảo rằng:
- **Đặt trước chỉ hết hạn khi sang ngày mới**
- **Button chỉ thay đổi khi thực sự cần thiết**
- **UX nhất quán và dễ hiểu**

Logic mới đảm bảo tính chính xác và cải thiện trải nghiệm người dùng đáng kể.
