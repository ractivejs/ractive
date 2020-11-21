import type defaults from './config/defaults';
import type { Ractive } from './RactiveDefinition';

interface Shared {
  defaults?: typeof defaults;
  Ractive?: typeof Ractive;
}

const shared: Shared = {};

export default shared;
