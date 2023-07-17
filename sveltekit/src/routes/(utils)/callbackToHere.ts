export function callbackToHere() {
  // Called on the server
  if (typeof window === "undefined") return "/";

  return window.location.pathname + window.location.search;
}
