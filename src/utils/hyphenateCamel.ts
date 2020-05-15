export default function(camelCaseStr: string): string {
  return camelCaseStr.replace(/([A-Z])/g, (_match, $1) => {
    return '-' + $1.toLowerCase();
  });
}
