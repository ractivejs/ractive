import runloop from 'src/global/runloop';
import { RactiveHTMLElement } from 'types/RactiveHTMLElement';
import { Transition as TransitionFunction, TransitionOpts } from 'types/Transition';
import { isObject } from 'utils/is';
import { fatal } from 'utils/log';
import Transition from 'view/items/element/Transition';

import { Ractive } from '../Ractive';

interface TransitionFunctionOpts extends TransitionOpts {
  [key: string]: unknown;
}

function Ractive$transition(
  this: Ractive,
  name: string | TransitionFunction,
  node: HTMLElement,
  params?: TransitionFunctionOpts
): Promise<void>;
function Ractive$transition(
  name: string | TransitionFunction,
  params: TransitionFunctionOpts
): Promise<void>;
function Ractive$transition(
  this: Ractive,
  name: string | TransitionFunction,
  node: HTMLElement | TransitionFunctionOpts,
  params?: TransitionFunctionOpts
): Promise<void> {
  if (node instanceof HTMLElement) {
    // good to go
  } else if (isObject(node)) {
    // omitted, use event node
    params = node;
  }

  // if we allow query selector, then it won't work
  // simple params like "fast"

  // else if ( typeof node === 'string' ) {
  // 	// query selector
  // 	node = this.find( node )
  // }

  const _node = <RactiveHTMLElement>(node || this.event.node);

  if (!_node || !_node._ractive) {
    fatal(`No node was supplied for transition ${name}`);
  }

  params = params || {};
  const owner = _node._ractive.proxy;
  const transition = new Transition({ owner, up: owner.up, name, params });
  transition.bind();

  const promise = runloop.start();
  runloop.registerTransition(transition);
  runloop.end();

  promise.then(() => transition.unbind());
  return promise;
}

export default Ractive$transition;
