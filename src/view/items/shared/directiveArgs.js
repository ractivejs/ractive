import getFunction from 'shared/getFunction';
import ExpressionProxy from 'src/view/resolvers/ExpressionProxy';
import resolveReference from '../../resolvers/resolveReference';

export function setupArgsFn(item, template, fragment, opts = {}) {
  if (template && template.f && template.f.s) {
    if (opts.register) {
      item.model = new ExpressionProxy(fragment, template.f);
      item.model.register(item);
    } else {
      item.fn = getFunction(template.f.s, template.f.r.length);
    }
  }
}

export function resolveArgs(item, template, fragment, opts = {}) {
  return template.f.r.map((ref, i) => {
    let model;

    if (opts.specialRef && (model = opts.specialRef(ref, i))) return model;

    model = resolveReference(fragment, ref);

    return model;
  });
}

export function teardownArgsFn(item) {
  if (item.model) item.model.unregister(item);
}
