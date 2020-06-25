const fnBind = Function.prototype.bind;

export default function bind<T, Y>(
  fn: T,
  context: unknown
): (T extends (...args) => Y ? Y : T) | T {
  if (!/this/.test(fn.toString())) return fn;

  const bound = fnBind.call(fn, context);
  for (const prop in fn) bound[prop] = fn[prop];

  return bound;
}
