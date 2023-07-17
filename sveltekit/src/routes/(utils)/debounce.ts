export function debounce(func: () => void, delay_ms: number) {
  let timeoutId: any;

  return function () {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(func, delay_ms);
  };
}
