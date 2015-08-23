import legacy from 'legacy';
import { isArray } from 'utils/is';
import prefix from './transitions/prefix';
import { warnOnceIfDebug } from 'utils/log';
import { extend } from 'utils/object';
import { missingPlugin } from 'config/errors';
import Fragment from 'view/Fragment';
import { findInViewHierarchy } from 'shared/registry';
import { visible } from 'config/visibility';
import createTransitions from './transitions/createTransitions';
import resetStyle from './transitions/resetStyle';
import Promise from 'utils/Promise';

const getComputedStyle = window.getComputedStyle || legacy.getComputedStyle;
const resolved = Promise.resolve();

export default class Transition {
	constructor ( owner, template, isIntro ) {
		this.owner = owner;
		this.isIntro = isIntro;
		this.ractive = owner.ractive;

		const ractive = owner.ractive;

		let name = template.n || template;

		if ( typeof name !== 'string' ) {
			const fragment = new Fragment({
				owner,
				template: name
			}).bind(); // TODO need a way to capture values without bind()

			name = fragment.toString();
			fragment.unbind();

			if ( name === '' ) {
				// empty string okay, just no transition
				return;
			}
		}

		this.name = name;

		if ( template.a ) {
			this.params = template.a;
		}

		else if ( template.d ) {
			// TODO is there a way to interpret dynamic arguments without all the
			// 'dependency thrashing'?
			const fragment = new Fragment({
				owner,
				template: template.d
			}).bind();

			this.params = fragment.getArgsList();
			fragment.unbind();
		}

		this._fn = findInViewHierarchy( 'transitions', ractive, name );

		if ( !this._fn ) {
			warnOnceIfDebug( missingPlugin( name, 'transition' ), { ractive });
		}
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

		var promise = new Promise( resolve => {
			var propertyNames, changedProperties, computedStyle, current, from, i, prop;

			// Edge case - if duration is zero, set style synchronously and complete
			if ( !options.duration ) {
				this.setStyle( to );
				resolve();
				return;
			}

			// Get a list of the properties we're animating
			propertyNames = Object.keys( to );
			changedProperties = [];

			// Store the current styles
			computedStyle = getComputedStyle( this.node );

			from = {};
			i = propertyNames.length;
			while ( i-- ) {
				prop = propertyNames[i];
				current = computedStyle[ prefix( prop ) ];

				if ( current === '0px' ) {
					current = 0;
				}

				// we need to know if we're actually changing anything
				if ( current != to[ prop ] ) { // use != instead of !==, so we can compare strings with numbers
					changedProperties.push( prop );

					// make the computed style explicit, so we can animate where
					// e.g. height='auto'
					this.node.style[ prefix( prop ) ] = current;
				}
			}

			// If we're not actually changing anything, the transitionend event
			// will never fire! So we complete early
			if ( !changedProperties.length ) {
				resolve();
				return;
			}

			createTransitions( this, to, options, changedProperties, resolve );
		});

		return promise;
	}

	getStyle ( props ) {
		var computedStyle, styles, i, prop, value;

		computedStyle = getComputedStyle( this.node );

		if ( typeof props === 'string' ) {
			value = computedStyle[ prefix( props ) ];
			if ( value === '0px' ) {
				value = 0;
			}
			return value;
		}

		if ( !isArray( props ) ) {
			throw new Error( 'Transition$getStyle must be passed a string, or an array of strings representing CSS properties' );
		}

		styles = {};

		i = props.length;
		while ( i-- ) {
			prop = props[i];
			value = computedStyle[ prefix( prop ) ];
			if ( value === '0px' ) {
				value = 0;
			}
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

	setStyle ( style, value ) {
		var prop;

		if ( typeof style === 'string' ) {
			this.node.style[ prefix( style ) ] = value;
		}

		else {
			for ( prop in style ) {
				if ( style.hasOwnProperty( prop ) ) {
					this.node.style[ prefix( prop ) ] = style[ prop ];
				}
			}
		}

		return this;
	}

	start () {
		var node, originalStyle, completed;

		node = this.node = this.owner.node;
		originalStyle = node.getAttribute( 'style' );

		// create t.complete() - we don't want this on the prototype,
		// because we don't want `this` silliness when passing it as
		// an argument
		this.complete = noReset => {
			if ( completed ) {
				return;
			}

			if ( !noReset && this.isIntro ) {
				resetStyle( node, originalStyle);
			}

			this._manager.remove( this );

			completed = true;
		};

		// If the transition function doesn't exist, abort
		if ( !this._fn ) {
			this.complete();
			return;
		}

		this._fn.apply( this.root, [ this ].concat( this.params ) );
	}
}
