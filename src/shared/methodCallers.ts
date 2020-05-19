export function bind(x): void {
  x.bind();
}
export function cancel(x): void {
  x.cancel();
}
export function destroyed(x): void {
  x.destroyed();
}
export function handleChange(x): void {
  x.handleChange();
}
export function mark(x): void {
  x.mark();
}
export function markForce(x): void {
  x.mark(true);
}
export function marked(x): void {
  x.marked();
}
export function markedAll(x): void {
  x.markedAll();
}
export function render(x): void {
  x.render();
}
export function shuffled(x): void {
  x.shuffled();
}
export function teardown(x): void {
  x.teardown();
}
export function unbind(x): void {
  x.unbind();
}
export function unrender(x): void {
  x.unrender();
}
export function unrenderAndDestroy(x): void {
  x.unrender(true);
}
export function update(x): void {
  x.update();
}
export function toString(x): string {
  return x.toString();
}
export function toEscapedString(x): string {
  return x.toString(true);
}
