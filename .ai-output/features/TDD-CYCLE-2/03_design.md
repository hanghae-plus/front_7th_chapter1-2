# Technical Design: TDD-CYCLE-2 - 반복 일정 UI 기능

**Feature ID**: TDD-CYCLE-2
**Created**: 2025-11-01
**Based on**: 01_analysis.md, 02_requirements.md
**Target**: src/App.tsx (SINGLE FILE MODE)

---

## 1. Codebase Context (Existing Architecture)

### Current src/App.tsx Structure
Based on exploration of the codebase:

**File Mode**: Single file (`src/App.tsx`) - NOT scope mode
- Main component integrating all hooks
- Current hooks used:
  - `useEventForm`: 일정 폼 상태 관리
  - `useEventOperations`: CRUD 작업
  - `useCalendarView`: 캘린더 뷰 상태
  - `useRecurringEvent`: 반복 일정 로직 (TDD-CYCLE-1)
  - `useNotifications`: 알림
  - `useSearch`: 검색

**Integration Point**:
- `src/App.tsx` is the single source of truth for UI orchestration
- All hooks are composed here
- Event handlers trigger hook methods

### Existing Patterns
**Hook Integration Pattern**:
```typescript
// Typical pattern in App.tsx
const { events, addEvent, updateEvent, deleteEvent } = useEventOperations();
const { ... } = useRecurringEvent();
// UI renders events and calls hook methods on user actions
```

**Modal Pattern** (likely exists or needs to be created):
```typescript
// Expected pattern
const [isModalOpen, setIsModalOpen] = useState(false);
// Modal component with confirm/cancel callbacks
```

---

## 2. System Design

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx (Main)                        │
├─────────────────────────────────────────────────────────────┤
│  1. Render Events with Repeat Icons                         │
│     - Check event.repeat → show <Repeat /> icon             │
│                                                               │
│  2. Edit Button Click                                        │
│     - if (event.repeat) → show EditConfirmModal             │
│     - else → direct edit                                     │
│                                                               │
│  3. Delete Button Click                                      │
│     - if (event.repeat) → show DeleteConfirmModal           │
│     - else → direct delete                                   │
│                                                               │
│  4. Modal Handlers                                           │
│     - handleSingleEdit() / handleAllEdit()                  │
│     - handleSingleDelete() / handleAllDelete()              │
└─────────────────────────────────────────────────────────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌──────────────┐   ┌──────────────────────┐   ┌──────────────┐
│ useRecurring │   │ useEventOperations   │   │ UI Components│
│ Event        │   │                      │   │              │
├──────────────┤   ├──────────────────────┤   ├──────────────┤
│• update      │   │• updateEvent()       │   │• RepeatIcon  │
│  Recurring   │   │• deleteEvent()       │   │• ConfirmModal│
│  Event()     │   │                      │   │              │
│• delete      │   │                      │   │              │
│  Recurring   │   │                      │   │              │
│  Event()     │   │                      │   │              │
└──────────────┘   └──────────────────────┘   └──────────────┘
```

### Data Flow
```typescript
// Flow 1: Icon Display
Event[] → map() → check event.repeat → render <Repeat /> icon

// Flow 2: Edit with Modal
onClick Edit
  → if event.repeat exists
    → setShowEditModal(true)
    → user selects "예" or "아니오"
    → "예": updateEvent() + remove repeat → remove icon
    → "아니오": updateRecurringEvent() → keep icon

// Flow 3: Delete with Modal
onClick Delete
  → if event.repeat exists
    → setShowDeleteModal(true)
    → user selects "예" or "아니오"
    → "예": deleteEvent(single)
    → "아니오": deleteRecurringEvent(all)
```

---

## 3. API Contracts (TypeScript Signatures)

### Type Definitions (to add to src/types.ts or App.tsx)

```typescript
/**
 * Modal state for recurring event confirmation
 */
interface RecurringModalState {
  isOpen: boolean;
  type: 'edit' | 'delete';
  event: Event | null;
}

/**
 * Modal action handlers
 */
interface RecurringModalHandlers {
  onSingle: () => void;
  onAll: () => void;
  onClose: () => void;
}

/**
 * Props for RecurringConfirmModal component
 */
interface RecurringConfirmModalProps {
  isOpen: boolean;
  type: 'edit' | 'delete';
  onSingle: () => void;
  onAll: () => void;
  onClose: () => void;
}
```

### Component Signatures

```typescript
/**
 * Main App component (existing, to be extended)
 */
function App(): JSX.Element {
  // Existing hooks
  const { events, addEvent, updateEvent, deleteEvent } = useEventOperations();
  const { updateRecurringEvent, deleteRecurringEvent } = useRecurringEvent();

  // NEW: Modal state
  const [modalState, setModalState] = useState<RecurringModalState>({
    isOpen: false,
    type: 'edit',
    event: null
  });

  // NEW: Event handlers
  const handleEditClick = (event: Event) => void;
  const handleDeleteClick = (event: Event) => void;
  const handleSingleEdit = () => void;
  const handleAllEdit = () => void;
  const handleSingleDelete = () => void;
  const handleAllDelete = () => void;

  return /* JSX with icons and modals */;
}

/**
 * NEW: Recurring confirm modal component
 */
function RecurringConfirmModal({
  isOpen,
  type,
  onSingle,
  onAll,
  onClose
}: RecurringConfirmModalProps): JSX.Element | null {
  if (!isOpen) return null;

  const message = type === 'edit'
    ? '해당 일정만 수정하시겠어요?'
    : '해당 일정만 삭제하시겠어요?';

  return (
    <div className="modal">
      <p>{message}</p>
      <button onClick={onSingle}>예</button>
      <button onClick={onAll}>아니오</button>
      <button onClick={onClose}>취소</button>
    </div>
  );
}

/**
 * NEW: Repeat icon component (inline or separate)
 */
function RepeatIcon({ className }: { className?: string }): JSX.Element {
  // Using lucide-react or similar icon library
  return <Repeat className={className} size={16} />;
}
```

### Hook Method Signatures (existing from useRecurringEvent)

```typescript
// Already implemented in TDD-CYCLE-1
interface UseRecurringEventReturn {
  updateRecurringEvent: (event: Event) => void;
  deleteRecurringEvent: (eventId: string) => void;
  // ... other methods
}
```

---

## 4. Architecture Decisions (ADRs)

### ADR-1: Modal Component Strategy

**Decision**: Inline modal component in App.tsx vs separate file

**Status**: Accepted (Inline)

**Context**:
- Simple modal with 3 buttons (예, 아니오, 취소)
- Only used in one place (App.tsx)
- Minimal logic

**Decision**:
Create inline `RecurringConfirmModal` function component within App.tsx

**Consequences**:
- ✅ Faster implementation (no new file)
- ✅ Easy access to state and handlers
- ✅ Less import overhead
- ❌ If modal becomes complex, refactor to separate file later

---

### ADR-2: Icon Library Choice

**Decision**: Use lucide-react for Repeat icon

**Status**: Accepted

**Context**:
- Need Repeat icon for recurring events
- Project likely already has an icon library
- Common options: lucide-react, react-icons, heroicons

**Decision**:
Use `<Repeat />` from lucide-react (or existing icon library)

**Consequences**:
- ✅ Lightweight and tree-shakeable
- ✅ Consistent with likely existing choices
- ✅ Easy to customize size/color
- ⚠️ If library not installed, add `pnpm add lucide-react`

---

### ADR-3: Single vs Separate Modals

**Decision**: Single modal component with `type` prop vs two separate modals

**Status**: Accepted (Single modal with type)

**Context**:
- Edit and delete modals are nearly identical
- Only difference: message text ("수정" vs "삭제")
- DRY principle

**Decision**:
Single `RecurringConfirmModal` with `type: 'edit' | 'delete'` prop

**Consequences**:
- ✅ Less code duplication
- ✅ Consistent UI/UX
- ✅ Easier to maintain
- ❌ Slightly more complex props interface

---

### ADR-4: State Management for Modal

**Decision**: Local useState vs global state

**Status**: Accepted (Local useState)

**Context**:
- Modal state is transient (only during user interaction)
- No need to persist or share across components
- App.tsx is the only consumer

**Decision**:
Use `useState<RecurringModalState>` in App.tsx

**Consequences**:
- ✅ Simple and straightforward
- ✅ No dependency on external state management
- ✅ Easy to test
- ❌ If App.tsx becomes too large, consider context or state library

---

## 5. Test Architecture (STRUCTURE ONLY)

### Test Categories

**Category 1: Icon Display**
- Purpose: Verify Repeat icon renders correctly
- File: `App.recurring-ui.spec.tsx`
- Example test cases:
  1. Shows icon for events with repeat property
  2. Hides icon for events without repeat property
  3. Icon renders in correct position (next to title)

**Category 2: Edit Modal Flow**
- Purpose: Verify edit confirmation modal behavior
- File: `App.recurring-ui.spec.tsx`
- Example test cases:
  1. Shows modal when editing recurring event
  2. Does not show modal for non-recurring events
  3. "예" button removes repeat and icon (single edit)
  4. "아니오" button keeps repeat and icon (all edit)
  5. "취소" button closes modal without changes

**Category 3: Delete Modal Flow**
- Purpose: Verify delete confirmation modal behavior
- File: `App.recurring-ui.spec.tsx`
- Example test cases:
  1. Shows modal when deleting recurring event
  2. Does not show modal for non-recurring events
  3. "예" button deletes single occurrence
  4. "아니오" button deletes all occurrences
  5. "취소" button closes modal without deletion

**Category 4: Integration with Hooks**
- Purpose: Verify correct hook methods are called
- File: `App.recurring-ui.spec.tsx`
- Example test cases:
  1. Calls `updateRecurringEvent()` on "아니오" (edit)
  2. Calls `deleteRecurringEvent()` on "아니오" (delete)
  3. Calls `updateEvent()` on "예" (single edit)
  4. Calls `deleteEvent()` on "예" (single delete)

### Test File Structure
```typescript
// src/__tests__/integration/App.recurring-ui.spec.tsx

describe('TDD-CYCLE-2: Recurring Event UI', () => {
  describe('Icon Display', () => {
    it('shows Repeat icon for recurring events', () => {});
    it('hides icon for non-recurring events', () => {});
    it('icon is next to event title', () => {});
  });

  describe('Edit Modal', () => {
    it('shows modal when editing recurring event', () => {});
    it('does not show modal for non-recurring event', () => {});

    describe('Single Edit (예)', () => {
      it('removes repeat property from event', () => {});
      it('removes Repeat icon', () => {});
      it('only updates single occurrence', () => {});
    });

    describe('All Edit (아니오)', () => {
      it('keeps repeat property', () => {});
      it('keeps Repeat icon', () => {});
      it('calls updateRecurringEvent()', () => {});
    });

    it('closes modal on 취소', () => {});
  });

  describe('Delete Modal', () => {
    it('shows modal when deleting recurring event', () => {});
    it('does not show modal for non-recurring event', () => {});

    describe('Single Delete (예)', () => {
      it('deletes only single occurrence', () => {});
      it('keeps other occurrences', () => {});
    });

    describe('All Delete (아니오)', () => {
      it('deletes all occurrences', () => {});
      it('calls deleteRecurringEvent()', () => {});
    });

    it('closes modal on 취소', () => {});
  });
});
```

**Test Count Target**: 15-25 tests (standard complexity)

---

## 6. Implementation Strategy

### Step 1: Add Type Definitions
```typescript
// In src/types.ts or top of App.tsx
interface RecurringModalState { ... }
interface RecurringConfirmModalProps { ... }
```

### Step 2: Create RecurringConfirmModal Component
```typescript
// Inline in App.tsx
function RecurringConfirmModal({ ... }) {
  // Modal UI with conditional message
}
```

### Step 3: Add Modal State to App
```typescript
const [modalState, setModalState] = useState<RecurringModalState>({
  isOpen: false,
  type: 'edit',
  event: null
});
```

### Step 4: Implement Event Handlers
```typescript
const handleEditClick = (event: Event) => {
  if (event.repeat) {
    setModalState({ isOpen: true, type: 'edit', event });
  } else {
    // Direct edit
  }
};

const handleSingleEdit = () => {
  // Remove repeat, update single event
};

const handleAllEdit = () => {
  // Call updateRecurringEvent()
};

// Similar for delete handlers
```

### Step 5: Update Event Rendering
```typescript
// In event map
{events.map(event => (
  <div key={event.id}>
    <span>{event.title}</span>
    {event.repeat && <RepeatIcon />}
    <button onClick={() => handleEditClick(event)}>Edit</button>
    <button onClick={() => handleDeleteClick(event)}>Delete</button>
  </div>
))}
```

### Step 6: Render Modal
```typescript
<RecurringConfirmModal
  isOpen={modalState.isOpen}
  type={modalState.type}
  onSingle={modalState.type === 'edit' ? handleSingleEdit : handleSingleDelete}
  onAll={modalState.type === 'edit' ? handleAllEdit : handleAllDelete}
  onClose={() => setModalState({ ...modalState, isOpen: false })}
/>
```

---

## 7. Handoff Summary

**To QA**:
- Technical design complete: inline modal, icon display, 6 event handlers
- 4 test categories defined: icon display, edit modal, delete modal, hook integration
- Expected 15-25 integration tests covering all scenarios
- File target: `src/__tests__/integration/App.recurring-ui.spec.tsx`

**Key Design Decisions**:
- Single modal component with type prop (edit/delete)
- Local state management (no global state)
- Inline components in App.tsx (simple, no separate files)
- Lucide-react for Repeat icon (or existing icon library)

**Next Phase**: QA creates failing tests, architect creates skeleton code
