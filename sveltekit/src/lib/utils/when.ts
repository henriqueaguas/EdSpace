export function when<T extends string, R>(
  value: T,
  cases: { [K in T]: R | (() => R) } & { default?: R },
): R | undefined {
  const found = Object.entries(cases).find(([k, v]) => k === value);
  if (!found) {
    return cases.default;
  }
  if (typeof found[1] === "function") {
    return found[1]()
  } else {
    return found[1];
  }
}

function calc(): "a" | "b" | "c" {
  return "a";
}
