export function humanizeAdapterName(name: string): string {
  if (!name) return '';
  return name.replace(/(?!^)([A-Z])/g, ' $1');
}
