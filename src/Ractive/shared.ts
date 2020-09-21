import { Ractive } from './RactiveDefinition';

interface Shared {
  defaults?: Record<string, unknown>;
  Ractive?: typeof Ractive;
}

const shared: Shared = {};

export default shared;
