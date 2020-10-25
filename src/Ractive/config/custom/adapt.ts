import { ensureArray, combine } from 'utils/array';

import type { Configurator } from '../config';

const adaptConfiguration: Configurator = {
  extend: (_Parent, proto, options) => {
    proto.adapt = combine(proto.adapt, ensureArray(options.adapt));
  },

  init(): void {}
};

export default adaptConfiguration;
