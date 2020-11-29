const fnBind = Function.prototype.bind;

export default function bind<T extends Function>(fn: Function, context: unknown): T {
  if (!/this/.test(fn.toString())) return <T>fn;

  const bound = fnBind.call(fn, context);
  for (const prop in fn) bound[prop] = fn[prop];

  return bound;
}
