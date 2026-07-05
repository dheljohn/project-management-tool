export function getUserInitials(name: string): string {
  if (!name) return "?";
  const cleaned = name.replace(/[_\-.]/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}
