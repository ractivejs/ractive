import { findInViewHierarchy } from 'shared/registry';
import { warnOnce } from 'utils/log';
import { missingPlugin } from 'config/errors';
import noop from 'utils/noop';
import runloop from 'src/global/runloop';
import { rebindMatch } from 'src/shared/rebind';
import findElement from '../shared/findElement';
import { setupArgsFn, teardownArgsFn } from '../shared/directiveArgs';

const missingDecorator = {
	update: noop,
	teardown: noop
};

export default class Decorator {
	constructor(options) {
		this.owner = options.owner || options.up.owner || findElement(options.up);
		this.element = this.owner.attributeByName
			? this.owner
			: findElement(options.up);
		this.up = options.up || this.owner.up;
		this.ractive = this.owner.ractive;
		const template = (this.template = options.template);

		this.name = template.n;

		this.node = null;
		this.handle = null;

		this.element.decorators.push(this);
	}

	bind() {
		setupArgsFn(this, this.template, this.up, { register: true });
	}

	bubble() {
		if (!this.dirty) {
			this.dirty = true;
			// decorators may be owned directly by an element or by a fragment if conditional
			this.owner.bubble();
			this.up.bubble();
		}
	}

	destroyed() {
		if (this.handle) {
			this.handle.teardown();
			this.handle = null;
		}
		this.shouldDestroy = true;
	}

	handleChange() {
		this.bubble();
	}

	rebind(next, previous, safe) {
		const idx = this.models.indexOf(previous);
		if (!~idx) return;

		next = rebindMatch(this.template.f.r[idx], next, previous);
		if (next === previous) return;

		previous.unregister(this);
		this.models.splice(idx, 1, next);
		if (next) next.addShuffleRegister(this, 'mark');

		if (!safe) this.bubble();
	}

	render() {
		this.shouldDestroy = false;
		if (this.handle) this.unrender();
		runloop.scheduleTask(() => {
			const fn = findInViewHierarchy('decorators', this.ractive, this.name);

			if (!fn) {
				warnOnce(missingPlugin(this.name, 'decorator'));
				this.handle = missingDecorator;
				return;
			}

			this.node = this.element.node;

			let args;
			if (this.fn) {
				args = this.models.map(model => {
					if (!model) return undefined;

					return model.get();
				});
				args = this.fn.apply(this.ractive, args);
			}

			this.handle = fn.apply(this.ractive, [this.node].concat(args));

			if (!this.handle || !this.handle.teardown) {
				throw new Error(
					`The '${
						this.name
					}' decorator must return an object with a teardown method`
				);
			}

			// watch out for decorators that cause their host element to be unrendered
			if (this.shouldDestroy) this.destroyed();
		}, true);
	}

	toString() {
		return '';
	}

	unbind() {
		teardownArgsFn(this, this.template);
	}

	unrender(shouldDestroy) {
		if ((!shouldDestroy || this.element.rendered) && this.handle) {
			this.handle.teardown();
			this.handle = null;
		}
	}

	update() {
		const instance = this.handle;

		if (!this.dirty) {
			if (instance && instance.invalidate) {
				runloop.scheduleTask(() => instance.invalidate(), true);
			}
			return;
		}

		this.dirty = false;

		if (instance) {
			if (!instance.update) {
				this.unrender();
				this.render();
			} else {
				const args = this.models.map(model => model && model.get());
				instance.update.apply(this.ractive, this.fn.apply(this.ractive, args));
			}
		}
	}
}
