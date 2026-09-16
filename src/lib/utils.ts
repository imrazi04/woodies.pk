export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Escapes % and _ so user input is matched literally in LIKE/ILIKE filters. */
export function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}
