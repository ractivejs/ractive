import runloop from 'src/global/runloop';
import { ValueMap } from 'types/Generic';
import { isObjectType } from 'utils/is';

import hooks from '../../events/Hook';
import config from '../config/config';
import dataConfigurator from '../config/custom/data';
import { Ractive } from '../RactiveDefinition';

const shouldRerender = ['template', 'partials', 'components', 'decorators', 'events'];

export default function Ractive$reset(this: Ractive, data: ValueMap): Promise<void> {
  data = data || {};

  if (!isObjectType(data)) {
    throw new Error('The reset method takes either no arguments, or an object containing new data');
  }

  // TEMP need to tidy this up
  data = dataConfigurator.init(this.constructor, this, { data });

  const promise = runloop.start();

  // If the root object is wrapped, try and use the wrapper's reset value
  const wrapper = this.viewmodel.wrapper;
  if (wrapper && wrapper.reset) {
    if (wrapper.reset(data) === false) {
      // reset was rejected, we need to replace the object
      this.viewmodel.set(data);
    }
  } else {
    this.viewmodel.set(data);
  }

  // reset config items and track if need to rerender
  const changes = config.reset(this);
  let rerender;

  let i = changes.length;
  while (i--) {
    if (shouldRerender.indexOf(changes[i]) > -1) {
      rerender = true;
      break;
    }
  }

  if (rerender) {
    hooks.unrender.fire(this);
    this.fragment.resetTemplate(this.template);
    hooks.render.fire(this);
    hooks.complete.fire(this);
  }

  runloop.end();

  hooks.reset.fire(this, data);

  return promise;
}
