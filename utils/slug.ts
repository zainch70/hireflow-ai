export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || "job";
}

export function createUniqueJobSlug(title: string): string {
  const base = slugify(title);
  const suffix = crypto.randomUUID().slice(0, 8);
  return `${base}-${suffix}`;
}
