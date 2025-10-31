# 이벤트 즐겨찾기 기능

사용자가 중요한 이벤트를 즐겨찾기로 표시하고 빠르게 접근할 수 있는 기능입니다.

## 주요 시나리오

- 사용자가 이벤트를 즐겨찾기에 추가
- 사용자가 즐겨찾기 목록 조회
- 사용자가 즐겨찾기에서 이벤트 제거

## 테스트 조건 명세

### 테스트 케이스 1: 즐겨찾기 추가

- **설명**: 사용자가 이벤트를 즐겨찾기에 추가하는 기능 테스트
- **Given**:
  - Mock 데이터: { id: '1', title: '테스트 이벤트', date: '2024-01-15' }
  - API 응답: { success: true, favoriteId: 'fav-1' }
- **When**:
  - 호출할 메서드: addToFavorites
  - 전달할 파라미터: { eventId: '1' }
- **Then**:
  - 상태 변화: loading이 false가 되고 error가 null이 됨
  - API 호출: POST /api/events/1/favorite
  - 사용자 피드백: '즐겨찾기에 추가되었습니다.' 메시지 표시

### 테스트 케이스 2: 즐겨찾기 목록 조회

- **설명**: 즐겨찾기 목록을 조회하는 기능 테스트
- **Given**:
  - Mock 데이터: [{ id: 'fav-1', eventId: '1', title: '테스트 이벤트' }]
  - API 응답: { success: true, favorites: [...] }
- **When**:
  - 호출할 메서드: getFavorites
  - 전달할 파라미터: {}
- **Then**:
  - 상태 변화: data에 즐겨찾기 목록이 저장됨
  - API 호출: GET /api/events/favorites
  - 사용자 피드백: 없음

### 테스트 케이스 3: 즐겨찾기 제거

- **설명**: 즐겨찾기에서 이벤트를 제거하는 기능 테스트
- **Given**:
  - Mock 데이터: { favoriteId: 'fav-1' }
  - API 응답: { success: true }
- **When**:
  - 호출할 메서드: removeFromFavorites
  - 전달할 파라미터: { favoriteId: 'fav-1' }
- **Then**:
  - 상태 변화: loading이 false가 되고 error가 null이 됨
  - API 호출: DELETE /api/events/1/favorite
  - 사용자 피드백: '즐겨찾기에서 제거되었습니다.' 메시지 표시

## API 명세

- POST /api/events/:id/favorite - 즐겨찾기 추가
- GET /api/events/favorites - 즐겨찾기 목록 조회
- DELETE /api/events/:id/favorite - 즐겨찾기 제거

## Hook 인터페이스 명세

```typescript
interface UseEventFavoritesReturn {
  loading: boolean;
  error: string | null;
  favorites: FavoriteEvent[] | null;

  addToFavorites: (eventId: string) => Promise<void>;
  getFavorites: () => Promise<void>;
  removeFromFavorites: (favoriteId: string) => Promise<void>;
}
```

## MSW 핸들러 명세

```typescript
http.post('/api/events/:id/favorite', () => {
  return HttpResponse.json({ success: true, favoriteId: 'fav-1' });
});

http.get('/api/events/favorites', () => {
  return HttpResponse.json({ success: true, favorites: [] });
});

http.delete('/api/events/:id/favorite', () => {
  return HttpResponse.json({ success: true });
});
```
