const pattern = /[-/\\^$*+?.()|[\]{}]/g;

export default function escapeRegExp(str: string): string {
  return str.replace(pattern, '\\$&');
}
