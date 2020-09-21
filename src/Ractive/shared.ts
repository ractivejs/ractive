import type { Ractive } from './RactiveDefinition';

interface Shared {
  defaults?: Record<string, unknown>;
  Ractive?: Ractive;
}

const shared: Shared = {};

export default shared;
