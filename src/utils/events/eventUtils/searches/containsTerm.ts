// Checks if the target string contains the search term (case-insensitive)
// 대상 문자열이 검색어를 포함하는지 확인합니다 (대소문자 구분 없음).

export function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}
