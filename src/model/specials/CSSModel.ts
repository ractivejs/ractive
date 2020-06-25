import { applyChanges } from '../../Ractive/static/styleSet';

import { SharedModel } from './SharedModel';

export default class CSSModel extends SharedModel {
  // TODO define what is this (sometimes is Ractive)
  private component: any;
  private locked: boolean;

  constructor(component) {
    super(component.cssData, '@style');

    this.component = component;
  }

  downstreamChanged(path: string[], depth: number): void {
    if (this.locked) return;

    const component = this.component;

    component.extensions.forEach(e => {
      const model: CSSModel = e._cssModel;
      model.mark();
      model.downstreamChanged(path, depth || 1);
    });

    if (!depth) {
      applyChanges(component, true);
    }
  }
}
