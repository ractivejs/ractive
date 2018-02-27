import { fatal } from 'utils/log';
import runloop from 'src/global/runloop';
import { win } from 'config/environment';

// because IE
const whitelist = {
	animationend: 1,
	animationiteration: 1,
	animationstart: 1,
	transitioncancel: 1,
	transitionend: 1,
	transitionstart: 1,
	transitionrun: 1
};

class DOMEvent {
	constructor(name, owner) {
		if (name.indexOf('*') !== -1) {
			fatal(
				`Only component proxy-events may contain "*" wildcards, <${
					owner.name
				} on-${name}="..."/> is not valid`
			);
		}

		this.name = name;
		this.owner = owner;
		this.handler = null;
	}

	bind() {}

	render(directive) {
		// schedule events so that they take place after twoway binding
		runloop.scheduleTask(() => {
			const node = this.owner.node;
			const name = this.name;
			const on = `on${name}`;

			// this is probably a custom event fired from a decorator or manually
			if (!(on in node) && !(on in win) && !whitelist[name]) return;

			this.owner.on(
				name,
				(this.handler = event => {
					return directive.fire({
						node,
						original: event,
						event,
						name
					});
				})
			);
		}, true);
	}

	unbind() {}

	unrender() {
		if (this.handler) this.owner.off(this.name, this.handler);
	}
}

class CustomEvent {
	constructor(eventPlugin, owner, name, args) {
		this.eventPlugin = eventPlugin;
		this.owner = owner;
		this.name = name;
		this.handler = null;
		this.args = args;
	}

	bind() {}

	render(directive) {
		runloop.scheduleTask(() => {
			const node = this.owner.node;

			this.handler = this.eventPlugin.apply(
				this.owner.ractive,
				[
					node,
					(event = {}) => {
						if (event.original) event.event = event.original;
						else event.original = event.event;

						event.name = this.name;
						event.node = event.node || node;
						return directive.fire(event);
					}
				].concat(this.args || [])
			);
		});
	}

	unbind() {}

	unrender() {
		this.handler.teardown();
	}
}

export { DOMEvent, CustomEvent };
