import { doc } from 'config/environment';
import hooks from 'src/events/Hook';
import { applyCSS } from 'src/global/css';
import runloop from 'src/global/runloop';
import type { Ractive } from 'src/Ractive/RactiveDefinition';
import type { RactiveHTMLElement } from 'types/RactiveHTMLElement';
import { getElement } from 'utils/dom';

import { createFragment } from './initialise';

export default function render(
  ractive: Ractive,
  target: RactiveHTMLElement,
  anchor: boolean | string | HTMLElement,
  occupants: HTMLElement[] | ChildNode[]
): Promise<void> {
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

  const anchorNode = getElement(anchor) || ractive.anchor;

  ractive.el = ractive.target = target;
  ractive.anchor = anchorNode;

  // ensure encapsulated CSS is up-to-date
  if (ractive.cssId) applyCSS();

  if (target) {
    (target.__ractive_instances__ || (target.__ractive_instances__ = [])).push(ractive);

    if (anchorNode) {
      const docFrag = doc.createDocumentFragment();
      ractive.fragment.render(docFrag);
      target.insertBefore(docFrag, anchorNode);
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
