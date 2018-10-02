import Fragment from '../Fragment';
import { ContainerItem } from './shared/Item';
import resolve from '../resolvers/resolve';

export function resolveAliases(aliases, fragment, dest = {}) {
  for (let i = 0; i < aliases.length; i++) {
    if (!dest[aliases[i].n]) {
      const m = resolve(fragment, aliases[i].x);
      dest[aliases[i].n] = m;
      m.reference();
    }
  }

  return dest;
}

export default class Alias extends ContainerItem {
  constructor(options) {
    super(options);

    this.fragment = null;
  }

  bind() {
    this.fragment = new Fragment({
      owner: this,
      template: this.template.f
    });

    this.fragment.aliases = resolveAliases(this.template.z, this.up);
    this.fragment.bind();
  }

  rebound(update) {
    const aliases = this.fragment.aliases;
    for (const k in aliases) {
      if (aliases[k].rebound) aliases[k].rebound(update);
      else {
        aliases[k].unreference();
        aliases[k] = 0;
      }
    }

    resolveAliases(this.template.z, this.up, aliases);

    if (this.fragment) this.fragment.rebound(update);
  }

  render(target, occupants) {
    this.rendered = true;
    if (this.fragment) this.fragment.render(target, occupants);
  }

  unbind(view) {
    for (const k in this.fragment.aliases) {
      this.fragment.aliases[k].unreference();
    }

    this.fragment.aliases = {};
    if (this.fragment) this.fragment.unbind(view);
  }

  unrender(shouldDestroy) {
    if (this.rendered && this.fragment) this.fragment.unrender(shouldDestroy);
    this.rendered = false;
  }

  update() {
    if (this.dirty) {
      this.dirty = false;
      this.fragment.update();
    }
  }
}
