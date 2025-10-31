// Pads the given number with leading zeros to ensure it has at least the specified size.
// 주어진 숫자를 지정된 크기만큼 앞에 0을 채워 반환합니다.

export function fillZero(value: number, size = 2) {
  return String(value).padStart(size, '0');
}
