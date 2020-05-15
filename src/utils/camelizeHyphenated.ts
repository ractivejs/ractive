export default function(hyphenatedStr: string): string {
  return hyphenatedStr.replace(/-([a-zA-Z])/g, (_match, $1) => {
    return $1.toUpperCase();
  });
}
