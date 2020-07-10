import TemplateItemType from 'config/types';
import { ElementTemplateItem } from 'parse/converters/templateItemDefinitions';
import runloop from 'src/global/runloop';

import Fragment from '../../../Fragment';
import createItem from '../../createItem';
import { ElementOpts } from '../../Element';
import Attribute from '../Attribute';
import { isBindable } from '../binding/selectBinding';

import Input from './Input';

export default class Textarea extends Input {
  constructor(options: ElementOpts) {
    const template: ElementTemplateItem = options.template;

    options.deferContent = true;

    super(options);

    // check for single interpolator binding
    if (!this.attributeByName.value) {
      if (template.f && isBindable({ template } as Attribute)) {
        (this.attributes || (this.attributes = [])).push(
          createItem({
            owner: this,
            template: { t: TemplateItemType.ATTRIBUTE, f: template.f, n: 'value' },
            up: this.up
          })
        );
      } else {
        this.fragment = new Fragment({
          owner: this,
          cssIds: null,
          template: template.f
        });
      }
    }
  }

  bubble(): void {
    if (!this.dirty) {
      this.dirty = true;

      if (this.rendered && !this.binding && this.fragment) {
        runloop.scheduleTask(() => {
          this.dirty = false;
          this.node.value = this.fragment.toString();
        });
      }

      this.up.bubble(); // default behaviour
    }
  }
}
