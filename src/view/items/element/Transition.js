import { win } from '../../../config/environment';
import legacy from '../../../legacy';
import { isArray } from '../../../utils/is';
import { addToArray, removeFromArray } from '../../../utils/array';
import findElement from '../shared/findElement';
import prefix from './transitions/prefix';
import { warnOnceIfDebug } from '../../../utils/log';
import { extend } from '../../../utils/object';
import { missingPlugin } from '../../../config/errors';
import { findInViewHierarchy } from '../../../shared/registry';
import { visible } from '../../../config/visibility';
import createTransitions from './transitions/createTransitions';
import resetStyle from './transitions/resetStyle';
import Promise from '../../../utils/Promise';
import { unbind } from '../../../shared/methodCallers';
import Fragment from '../../Fragment';
import { rebindMatch } from '../../../shared/rebind';
import { setupArgsFn, teardownArgsFn } from '../shared/directiveArgs';

const getComputedStyle = win && ( win.getComputedStyle || legacy.getComputedStyle );
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

		// As of 0.3.9, transition authors should supply an `option` object with
		// `duration` and `easing` properties (and optional `delay`), plus a
		// callback function that gets called after the animation completes

		// TODO remove this check in a future version
		if ( !options ) {
			warnOnceIfDebug( 'The "%s" transition does not supply an options object to `t.animateStyle()`. This will break in a future version of Ractive. For more info see https://github.com/RactiveJS/Ractive/issues/340', this.name );
			options = this;
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
			let changedProperties = [];

			// Store the current styles
			const computedStyle = getComputedStyle( this.owner.node );

			let i = propertyNames.length;
			while ( i-- ) {
				const prop = propertyNames[i];
				let current = computedStyle[ prefix( prop ) ];

				if ( current === '0px' ) current = 0;

				// we need to know if we're actually changing anything
				if ( current != to[ prop ] ) { // use != instead of !==, so we can compare strings with numbers
					changedProperties.push( prop );

					// make the computed style explicit, so we can animate where
					// e.g. height='auto'
					this.owner.node.style[ prefix( prop ) ] = current;
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
		if ( options.template ) {
			if ( options.template.v === 't0' || options.template.v == 't1' ) this.element._introTransition = this;
			if ( options.template.v === 't0' || options.template.v == 't2' ) this.element._outroTransition = this;
			this.eventName = names[ options.template.v ];
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

		setupArgsFn( this, options.template, this.parentFragment );
	}

	destroyed () {}

	getStyle ( props ) {
		const computedStyle = getComputedStyle( this.owner.node );

		if ( typeof props === 'string' ) {
			let value = computedStyle[ prefix( props ) ];
			return value === '0px' ? 0 : value;
		}

		if ( !isArray( props ) ) {
			throw new Error( 'Transition$getStyle must be passed a string, or an array of strings representing CSS properties' );
		}

		let styles = {};

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

		return extend( {}, defaults, params );
	}

	rebinding ( next, previous ) {
		const idx = this.models.indexOf( previous );
		if ( !~idx ) return;

		next = rebindMatch( this.template.f.r[ idx ], next, previous );
		if ( next === previous ) return;

		previous.unregister( this );
		this.models.splice( idx, 1, next );
		if ( next ) next.addShuffleRegister( this, 'mark' );
	}

	registerCompleteHandler ( fn ) {
		addToArray( this.onComplete, fn );
	}

	render () {}

	setStyle ( style, value ) {
		if ( typeof style === 'string' ) {
			this.owner.node.style[ prefix( style ) ] = value;
		}

		else {
			let prop;
			for ( prop in style ) {
				if ( style.hasOwnProperty( prop ) ) {
					this.owner.node.style[ prefix( prop ) ] = style[ prop ];
				}
			}
		}

		return this;
	}

	start () {
		const node = this.node = this.element.node;
		const originalStyle = node.getAttribute( 'style' );

		let completed;
		let args = this.params;

		// create t.complete() - we don't want this on the prototype,
		// because we don't want `this` silliness when passing it as
		// an argument
		this.complete = noReset => {
			if ( completed ) {
				return;
			}

			this.onComplete.forEach( fn => fn() );
			if ( !noReset && this.isIntro ) {
				resetStyle( node, originalStyle);
			}

			this._manager.remove( this );

			if ( this.shouldUnbind ) teardownArgsFn( this, this.options.template );

			completed = true;
		};

		// If the transition function doesn't exist, abort
		if ( !this._fn ) {
			this.complete();
			return;
		}

		// get expression args if supplied
		if ( this.fn ) {
			const values = this.models.map( model => {
				if ( !model ) return undefined;

				return model.get();
			});
			args = this.fn.apply( this.ractive, values );
		}

		const promise = this._fn.apply( this.ractive, [ this ].concat( args ) );
		if ( promise ) promise.then( this.complete );
	}

	toString () { return ''; }

	unbind () {
		this.shouldUnbind = true;
	}

	unregisterCompleteHandler ( fn ) {
		removeFromArray( this.onComplete, fn );
	}

	unrender () {}

	update () {}
}
