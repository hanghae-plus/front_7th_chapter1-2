// In-memory event store for isolated test environments
// 격리된 테스트 환경을 위한 메모리 내 이벤트 저장소

import { EventProps } from '@/types/events/Event.types';

// A simple in-memory event store for testing purposes
// 테스트 목적의 간단한 메모리 내 이벤트 저장소
export class TestEventStore {
  private events: EventProps[] = [];

  // Initialize the store with optional initial events
  constructor(initEvents: EventProps[] = []) {
    this.events = [...initEvents];
  }

  // Retrieve all events (returns a copy to prevent direct mutation)
  // 모든 이벤트 조회 (직접 변경을 방지하기 위해 복사본 반환)
  getEvents(): readonly EventProps[] {
    return [...this.events];
  }

  // Get event by ID
  // ID로 이벤트 조회
  getEventById(id: string): EventProps | null {
    return this.events.find((e) => e.id === id) || null;
  }

  // Get total number of events
  // 총 이벤트 수 조회
  getEventCount(): number {
    return this.events.length;
  }

  // Add a new event (creates a copy to prevent external mutation)
  // 새 이벤트 추가 (외부 변경을 방지하기 위해 복사본 생성)
  addEvent(event: EventProps): void {
    this.events.push({ ...event });
  }

  // Update an existing event by ID
  updateEvent(id: string, updates: Partial<EventProps>): EventProps | null {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return null;

    // Update the event with the provided fields (immutable update)
    // 제공된 필드로 이벤트 업데이트 (불변 업데이트)
    this.events[index] = { ...this.events[index], ...updates };
    return { ...this.events[index] };
  }

  // Delete an event by ID
  deleteEvent(id: string): boolean {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return false;

    // Remove the event from the store
    this.events.splice(index, 1);
    return true;
  }

  // Reset the store to initial events
  reset(initEvents: EventProps[] = []): void {
    this.events = [...initEvents];
  }
}
