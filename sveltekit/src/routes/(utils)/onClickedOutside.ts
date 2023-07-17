export function onClickedOutside(
  element: HTMLElement | null,
  onOut: () => void,
) {
  const handleClickOutside = (event: any) => {
    if (!element || !element.contains(event.target)) {
      onOut();
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => document.removeEventListener("mousedown", handleClickOutside);
}
