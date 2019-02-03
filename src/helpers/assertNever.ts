export function assertNever(x: never, errorMessage?: string): never {
  throw new Error(errorMessage || "Unexpected object: " + x);
}
