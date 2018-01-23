import { win } from '../../../config/environment';
import { addToArray, removeFromArray } from '../../../utils/array';
import { isObject } from '../../../utils/is';
import findElement from '../shared/findElement';
import prefix from './transitions/prefix';
import { warnOnceIfDebug } from '../../../utils/log';
import { missingPlugin } from '../../../config/errors';
import { findInViewHierarchy } from '../../../shared/registry';
import { visible } from '../../../config/visibility';
import createTransitions from './transitions/createTransitions';
import { resolveArgs, setupArgsFn } from '../shared/directiveArgs';
import noop from '../../../utils/noop';

const getComputedStyle = win && win.getComputedStyle;
const resolved = Promise.resolve();

const names = {
	t0: 'intro-outro',
	t1: 'intro',
	t2: 'outro'
};

export default class Transition {
	constructor ( options ) {
		this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
		this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment );
		this.ractive = this.owner.ractive;
		this.template = options.template;
		this.parentFragment = options.parentFragment;
		this.options = options;
		this.onComplete = [];
	}

	animateStyle ( style, value, options ) {
		if ( arguments.length === 4 ) {
			throw new Error( 't.animateStyle() returns a promise - use .then() instead of passing a callback' );
		}

		// Special case - page isn't visible. Don't animate anything, because
		// that way you'll never get CSS transitionend events
		if ( !visible ) {
			this.setStyle( style, value );
			return resolved;
		}

		let to;

		if ( typeof style === 'string' ) {
			to = {};
			to[ style ] = value;
		} else {
			to = style;

			// shuffle arguments
			options = value;
		}

		return new Promise( fulfil => {
			// Edge case - if duration is zero, set style synchronously and complete
			if ( !options.duration ) {
				this.setStyle( to );
				fulfil();
				return;
			}

			// Get a list of the properties we're animating
			const propertyNames = Object.keys( to );
			const changedProperties = [];

			// Store the current styles
			const computedStyle = getComputedStyle( this.node );

			let i = propertyNames.length;
			while ( i-- ) {
				const prop = propertyNames[i];
				const name = prefix( prop );

				const current = computedStyle[ prefix( prop ) ];

				// record the starting points
				const init = this.node.style[name];
				if ( !( name in this.originals ) ) this.originals[ name ] = this.node.style[ name ];
				this.node.style[ name ] = to[ prop ];
				this.targets[ name ] = this.node.style[ name ];
				this.node.style[ name ] = init;

				// we need to know if we're actually changing anything
				if ( current != to[ prop ] ) { // use != instead of !==, so we can compare strings with numbers
					changedProperties.push( name );

					// if we happened to prefix, make sure there is a properly prefixed value
					to[ name ] = to[ prop ];

					// make the computed style explicit, so we can animate where
					// e.g. height='auto'
					this.node.style[ name ] = current;
				}
			}

			// If we're not actually changing anything, the transitionend event
			// will never fire! So we complete early
			if ( !changedProperties.length ) {
				fulfil();
				return;
			}

			createTransitions( this, to, options, changedProperties, fulfil );
		});
	}

	bind () {
		const options = this.options;
		const type = options.template && options.template.v;
		if ( type ) {
			if ( type === 't0' || type === 't1' ) this.element.intro = this;
			if ( type === 't0' || type === 't2' ) this.element.outro = this;
			this.eventName = names[ type ];
		}

		const ractive = this.owner.ractive;

		this.name = options.name || options.template.n;

		if ( options.params ) {
			this.params = options.params;
		}

		if ( typeof this.name === 'function' ) {
			this._fn = this.name;
			this.name = this._fn.name;
		} else {
			this._fn = findInViewHierarchy( 'transitions', ractive, this.name );
		}

		if ( !this._fn ) {
			warnOnceIfDebug( missingPlugin( this.name, 'transition' ), { ractive });
		}

		setupArgsFn( this, options.template );
	}

	getParams () {
		if ( this.params ) return this.params;

		// get expression args if supplied
		if ( this.fn ) {
			const values = resolveArgs( this, this.template, this.parentFragment ).map( model => {
				if ( !model ) return undefined;

				return model.get();
			});
			return this.fn.apply( this.ractive, values );
		}
	}

	getStyle ( props ) {
		const computedStyle = getComputedStyle( this.node );

		if ( typeof props === 'string' ) {
			return computedStyle[ prefix( props ) ];
		}

		if ( !Array.isArray( props ) ) {
			throw new Error( 'Transition$getStyle must be passed a string, or an array of strings representing CSS properties' );
		}

		const styles = {};

		let i = props.length;
		while ( i-- ) {
			const prop = props[i];
			let value = computedStyle[ prefix( prop ) ];

			if ( value === '0px' ) value = 0;
			styles[ prop ] = value;
		}

		return styles;
	}

	processParams ( params, defaults ) {
		if ( typeof params === 'number' ) {
			params = { duration: params };
		}

		else if ( typeof params === 'string' ) {
			if ( params === 'slow' ) {
				params = { duration: 600 };
			} else if ( params === 'fast' ) {
				params = { duration: 200 };
			} else {
				params = { duration: 400 };
			}
		} else if ( !params ) {
			params = {};
		}

		return Object.assign( {}, defaults, params );
	}

	registerCompleteHandler ( fn ) {
		addToArray( this.onComplete, fn );
	}

	setStyle ( style, value ) {
		if ( typeof style === 'string' ) {
			const name = prefix(  style );
			if ( !this.originals.hasOwnProperty( name ) ) this.originals[ name ] = this.node.style[ name ];
			this.node.style[ name ] = value;
			this.targets[ name ] = this.node.style[ name ];
		}

		else {
			let prop;
			for ( prop in style ) {
				if ( style.hasOwnProperty( prop ) ) {
					this.setStyle( prop, style[ prop ] );
				}
			}
		}

		return this;
	}

	shouldFire ( type ) {
		if ( !this.ractive.transitionsEnabled ) return false;

		// check for noIntro and noOutro cases, which only apply when the owner ractive is rendering and unrendering, respectively
		if ( type === 'intro' && this.ractive.rendering && nearestProp( 'noIntro', this.ractive, true ) ) return false;
		if ( type === 'outro' && this.ractive.unrendering && nearestProp( 'noOutro', this.ractive, false ) ) return false;

		const params = this.getParams(); // this is an array, the params object should be the first member
		// if there's not a parent element, this can't be nested, so roll on
		if ( !this.element.parent ) return true;

		// if there is a local param, it takes precedent
		if ( params && params[0] && isObject(params[0]) && 'nested' in params[0] ) {
			if ( params[0].nested !== false ) return true;
		} else { // use the nearest instance setting
			// find the nearest instance that actually has a nested setting
			if ( nearestProp( 'nestedTransitions', this.ractive ) !== false ) return true;
		}

		// check to see if this is actually a nested transition
		let el = this.element.parent;
		while ( el ) {
			if ( el[type] && el[type].starting ) return false;
			el = el.parent;
		}

		return true;
	}

	start () {
		const node = this.node = this.element.node;
		const originals = this.originals = {};  //= node.getAttribute( 'style' );
		const targets = this.targets = {};

		let completed;
		const args = this.getParams();

		// create t.complete() - we don't want this on the prototype,
		// because we don't want `this` silliness when passing it as
		// an argument
		this.complete = noReset => {
			this.starting = false;
			if ( completed ) {
				return;
			}

			this.onComplete.forEach( fn => fn() );
			if ( !noReset && this.isIntro ) {
				for ( const k in targets ) {
					if ( node.style[ k ] === targets[ k ] ) node.style[ k ] = originals[ k ];
				}
			}

			this._manager.remove( this );

			completed = true;
		};

		// If the transition function doesn't exist, abort
		if ( !this._fn ) {
			this.complete();
			return;
		}

		const promise = this._fn.apply( this.ractive, [ this ].concat( args ) );
		if ( promise ) promise.then( this.complete );
	}

	toString () { return ''; }

	unbind () {
		if ( !this.element.attributes.unbinding ) {
			const type = this.options && this.options.template && this.options.template.v;
			if ( type === 't0' || type === 't1' ) this.element.intro = null;
			if ( type === 't0' || type === 't2' ) this.element.outro = null;
		}
	}

	unregisterCompleteHandler ( fn ) {
		removeFromArray( this.onComplete, fn );
	}
}

const proto = Transition.prototype;
proto.destroyed = proto.render = proto.unrender = proto.update = noop;

function nearestProp ( prop, ractive, rendering ) {
	let instance = ractive;
	while ( instance ) {
		if ( instance.hasOwnProperty( prop ) && ( rendering === undefined || rendering ? instance.rendering : instance.unrendering ) ) return instance[ prop ];
		instance = instance.component && instance.component.ractive;
	}

	return ractive[ prop ];
}
