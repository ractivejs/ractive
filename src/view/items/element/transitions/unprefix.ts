import { vendors } from 'config/environment';

const unprefixPattern = new RegExp('^-(?:' + vendors.join('|') + ')-');

export default function(prop: string): string {
  return prop.replace(unprefixPattern, '');
}
