# Borrow Utils

Utility functions for handling borrow record calculations and date operations.

## Functions

### `calculateDueDate(borrowDate: string, readerType: ReaderTypeConfig): string`

Calculates the due date for a borrow record based on the borrow date and reader type.

**Parameters:**
- `borrowDate`: Borrow date in YYYY-MM-DD format
- `readerType`: Reader type configuration containing `borrowDurationDays`

**Returns:**
- Due date in YYYY-MM-DD format

**Example:**
```typescript
const borrowDate = '2024-01-01';
const readerType = {
  id: '1',
  typeName: 'student',
  maxBorrowLimit: 5,
  borrowDurationDays: 14,
  description: 'Student reader type',
  lateReturnFinePerDay: 1000,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const dueDate = calculateDueDate(borrowDate, readerType);
// Returns: '2024-01-15'
```

### `getTodayDate(): string`

Gets today's date in YYYY-MM-DD format.

**Returns:**
- Today's date in YYYY-MM-DD format

**Example:**
```typescript
const today = getTodayDate();
// Returns: '2024-01-15' (current date)
```

### `getBorrowDurationDays(readerType: ReaderTypeConfig): number`

Gets the borrow duration days from a reader type configuration.

**Parameters:**
- `readerType`: Reader type configuration

**Returns:**
- Number of days for borrowing

**Example:**
```typescript
const duration = getBorrowDurationDays(readerType);
// Returns: 14
```

## Usage in Reservation Fulfillment

When fulfilling a reservation, the system now:

1. Gets the reader's information and reader type
2. Calculates today's date as the borrow date
3. Calculates the due date based on the reader type's `borrowDurationDays`
4. Creates a borrow record with status "borrowed"
5. Updates the physical copy status to "borrowed"

This ensures that the borrow duration is automatically calculated based on the reader's type, providing a more flexible and accurate system for managing library loans.
