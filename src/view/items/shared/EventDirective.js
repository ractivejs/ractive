import { ANCHOR, COMPONENT } from '../../../config/types';
import fireEvent from '../../../events/fireEvent';
import { splitKeypath } from '../../../shared/keypaths';
import findElement from './findElement';
import { findInViewHierarchy } from '../../../shared/registry';
import { DOMEvent, CustomEvent } from '../element/ElementEvents';
import RactiveEvent from '../component/RactiveEvent';
import runloop from '../../../global/runloop';
import { addHelpers } from '../../helpers/contextMethods';
import { setupArgsFn, teardownArgsFn } from '../shared/directiveArgs';
import { warnOnceIfDebug } from '../../../utils/log';

const specialPattern = /^(event|arguments)(\..+)?$/;
const dollarArgsPattern = /^\$(\d+)(\..+)?$/;

export default class EventDirective {
	constructor ( options ) {
		this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
		this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment, true );
		this.template = options.template;
		this.parentFragment = options.parentFragment;
		this.ractive = options.parentFragment.ractive;

		this.events = [];

		if ( this.element.type === COMPONENT || this.element.type === ANCHOR ) {
			this.template.n.forEach( n => {
				this.events.push( new RactiveEvent( this.element, n ) );
			});
		} else {
			this.template.n.forEach( n => {
				const fn = findInViewHierarchy( 'events', this.ractive, n );
				// we need to pass in "this" in order to get
				// access to node when it is created.
				this.events.push( fn ? new CustomEvent( fn, this.element ) : new DOMEvent( n, this.element ) );
			});
		}

		// method calls
		this.resolvers = null;
		this.models = null;
	}

	bind () {
		setupArgsFn( this, this.template, this.parentFragment, {
			specialRef ( ref ) {
				const specialMatch = specialPattern.exec( ref );
				if ( specialMatch ) {
					// on-click="foo(event.node)"
					return {
						special: specialMatch[1],
						keys: specialMatch[2] ? splitKeypath( specialMatch[2].substr(1) ) : []
					};
				}

				const dollarMatch = dollarArgsPattern.exec( ref );
				if ( dollarMatch ) {
					// on-click="foo($1)"
					return {
						special: 'arguments',
						keys: [ dollarMatch[1] - 1 ].concat( dollarMatch[2] ? splitKeypath( dollarMatch[2].substr( 1 ) ) : [] )
					};
				}
			}
		});
		if ( !this.fn ) this.action = this.template.f;
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.owner.bubble();
		}
	}

	destroyed () {
		this.events.forEach( e => e.unlisten() );
	}

	fire ( event, passedArgs = [] ) {

		// augment event object
		if ( event && !event.hasOwnProperty( '_element' ) ) {
		   addHelpers( event, this.owner );
		}

		if ( this.fn ) {
			const values = [];

			if ( event ) passedArgs.unshift( event );

			if ( this.models ) {
				this.models.forEach( model => {
					if ( !model ) return values.push( undefined );

					if ( model.special ) {
						let obj = model.special === 'event' ? event : passedArgs;
						const keys = model.keys.slice();

						while ( keys.length ) obj = obj[ keys.shift() ];
						return values.push( obj );
					}

					if ( model.wrapper ) {
						return values.push( model.wrapperValue );
					}

					values.push( model.get() );
				});
			}

			// make event available as `this.event`
			const ractive = this.ractive;
			const oldEvent = ractive.event;

			ractive.event = event;
			const result = this.fn.apply( ractive, values ).pop();

			// Auto prevent and stop if return is explicitly false
			if ( result === false ) {
				const original = event ? event.original : undefined;
				if ( original ) {
					original.preventDefault && original.preventDefault();
					original.stopPropagation && original.stopPropagation();
				} else {
					warnOnceIfDebug( `handler '${this.template.n.join( ' ' )}' returned false, but there is no event available to cancel` );
				}
			}

			ractive.event = oldEvent;
		}

		else {
			let args = [];
			if ( passedArgs.length ) args = args.concat( passedArgs );
			if ( event ) event.name = this.action;

			fireEvent( this.ractive, this.action, {
				event,
				args
			});
		}
	}

	handleChange () {}

	rebinding ( next, previous ) {
		if ( !this.models ) return;
		const idx = this.models.indexOf( previous );

		if ( ~idx ) {
			this.models.splice( idx, 1, next );
			previous.unregister( this );
			if ( next ) next.addShuffleTask( () => next.register( this ) );
		}
	}

	render () {
		// render events after everything else, so they fire after bindings
		runloop.scheduleTask( () => this.events.forEach( e => e.listen( this ), true ) );
	}

	toString() { return ''; }

	unbind () {
		teardownArgsFn( this, this.template );
	}

	unrender () {
		this.events.forEach( e => e.unlisten() );
	}

	update () {
		// noop
	}
}
