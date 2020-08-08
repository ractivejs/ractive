import { create, keys } from 'utils/object';

import { createFunction } from '../Ractive/config/runtime-parser';

const functions: Record<string, Function> = create(null);

export default function getFunction(str: string, i: number): Function {
  if (functions[str]) return functions[str];
  return (functions[str] = createFunction(str, i));
}

// TODO refine function using types
export function addFunctions(template): void {
  if (!template) return;

  const exp = template.e;

  if (!exp) return;

  keys(exp).forEach(str => {
    if (functions[str]) return;
    functions[str] = exp[str];
  });
}
