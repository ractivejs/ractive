import type { Static } from 'src/Ractive/RactiveDefinition';
import type { ExtendOpts } from 'types/InitOptions';
import { ensureArray, combine } from 'utils/array';

interface AdaptConfigurator {
  extend: (_Parent: typeof Static, proto: typeof Static, options: ExtendOpts) => void;
  init: () => void;
}

const adaptConfiguration: AdaptConfigurator = {
  extend: (_Parent, proto, options): void => {
    proto.adapt = combine(proto.adapt, ensureArray(options.adapt));
  },

  init(): void {}
};

export default adaptConfiguration;
