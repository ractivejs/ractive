import Context from 'shared/Context';
import fireEvent from 'src/events/fireEvent';
import { isObjectType } from 'utils/is';
import { assign, create } from 'utils/object';

import type { Ractive } from '../RactiveDefinition';

function Ractive$fire(this: Ractive, eventName: string, ...args: [Context, ...unknown[]]): boolean;
function Ractive$fire(this: Ractive, eventName: string, ...args: unknown[]): boolean;
function Ractive$fire(
  this: Ractive,
  eventName: string,
  ...args: [Context | unknown, ...unknown[]]
): boolean {
  let ctx: Context;

  // watch for reproxy
  if (args[0] instanceof Context) {
    const proto = args.shift() as Context;
    ctx = create(proto);
    assign(ctx, proto);
  } else if (isObjectType(args[0]) && (args[0] === null || args[0].constructor === Object)) {
    ctx = Context.forRactive(this, args.shift());
  } else {
    ctx = Context.forRactive(this);
  }

  return fireEvent(this, eventName, ctx, args);
}

export default Ractive$fire;
