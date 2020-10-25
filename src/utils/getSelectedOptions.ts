import { toArray } from './array';

export default function getSelectedOptions(select: HTMLSelectElement): HTMLOptionElement[] {
  /* istanbul ignore next */
  if (select.selectedOptions) {
    return toArray(select.selectedOptions);
  } else if (select.options) {
    return toArray(select.options).filter((option: HTMLOptionElement) => option.selected);
  }

  return [];
}
