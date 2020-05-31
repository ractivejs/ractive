import { doc } from 'config/environment';
import hooks from 'src/events/Hook';
import { applyCSS } from 'src/global/css';
import runloop from 'src/global/runloop';
import { getElement } from 'utils/dom';

import { createFragment } from './initialise';

export default function render(ractive, target, anchor, occupants) {
  // set a flag to let any transitions know that this instance is currently rendering
  ractive.rendering = true;

  const promise = runloop.start();
  runloop.scheduleTask(() => hooks.render.fire(ractive), true);

  if (ractive.fragment.rendered) {
    throw new Error(
      'You cannot call ractive.render() on an already rendered instance! Call ractive.unrender() first'
    );
  }

  if (ractive.destroyed) {
    ractive.destroyed = false;
    ractive.fragment = createFragment(ractive).bind(ractive.viewmodel);
  }

  anchor = getElement(anchor) || ractive.anchor;

  ractive.el = ractive.target = target;
  ractive.anchor = anchor;

  // ensure encapsulated CSS is up-to-date
  if (ractive.cssId) applyCSS();

  if (target) {
    (target.__ractive_instances__ || (target.__ractive_instances__ = [])).push(ractive);

    if (anchor) {
      const docFrag = doc.createDocumentFragment();
      ractive.fragment.render(docFrag);
      target.insertBefore(docFrag, anchor);
    } else {
      ractive.fragment.render(target, occupants);
    }
  }

  runloop.end();
  ractive.rendering = false;

  return promise.then(() => {
    if (ractive.torndown) return;

    hooks.complete.fire(ractive);
  });
}
