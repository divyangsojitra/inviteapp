export function createEventSlug(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  const suffix = crypto.randomUUID().slice(0, 8);

  return `${base || "event"}-${suffix}`;
}
