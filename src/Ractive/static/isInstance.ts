// todo change return value to `object is Ractive`
export default function isInstance(object: unknown): boolean {
  return object && object instanceof this;
}
