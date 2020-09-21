import { vendors } from 'config/environment';

const vendorPattern = new RegExp('^(?:' + vendors.join('|') + ')([A-Z])');

export default function (str: string): string {
  /* istanbul ignore next */
  if (!str) return ''; // edge case

  /* istanbul ignore next */
  if (vendorPattern.test(str)) str = '-' + str;

  return str.replace(/[A-Z]/g, match => '-' + match.toLowerCase());
}
