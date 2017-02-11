import { ANCHOR, COMPONENT } from '../../../config/types';
import fireEvent from '../../../events/fireEvent';
import { splitKeypath } from '../../../shared/keypaths';
import findElement from './findElement';
import { findInViewHierarchy } from '../../../shared/registry';
import { DOMEvent, CustomEvent } from '../element/ElementEvents';
import RactiveEvent from '../component/RactiveEvent';
import runloop from '../../../global/runloop';
import { resolveArgs, setupArgsFn } from '../shared/directiveArgs';
import { warnOnceIfDebug } from '../../../utils/log';
import { addToArray, removeFromArray } from '../../../utils/array';
import noop from '../../../utils/noop';
import Item from './Item';

const specialPattern = /^(event|arguments|@event|@context|@node)(\..+)?$/;
const dollarArgsPattern = /^\$(\d+)(\..+)?$/;

export const DelegateProxy = {
	fire ( event, passedArgs = [] ) {
		if ( event && event.original ) {
			const ev = event.original;

			// TODO if IE<9 needs to be supported here, could probably walk to the element with a ractive proxy with a delegates property
			const end = ev.currentTarget;
			let node = ev.target;
			const name = event.name;
			let bubble = true;

			// starting with the origin node, walk up the DOM looking for ractive nodes with a matching event listener
			while ( bubble && node !== end ) {
				const el = node._ractive && node._ractive.proxy;

				if ( el ) {
					// set up the context for the handler
					event.node = el.node;
					event.name = name;

					el.events.forEach( ev => {
						if ( ~ev.template.n.indexOf( name ) ) {
							bubble = ev.fire( event, passedArgs ) !== false && bubble;
						}
					});
				}

				node = node.parentNode;
			}

			return bubble;
		}
	}
};

export default class EventDirective {
	constructor ( options ) {
		this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
		this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment, true );
		this.template = options.template;
		this.parentFragment = options.parentFragment;
		this.ractive = options.parentFragment.ractive;
		const delegate = this.delegate = this.ractive.delegate && options.parentFragment.delegate;
		this.events = [];

		if ( this.element.type === COMPONENT || this.element.type === ANCHOR ) {
			this.template.n.forEach( n => {
				this.events.push( new RactiveEvent( this.element, n ) );
			});
		} else {
			// make sure the delegate element has a storag object
			if ( delegate && !delegate.delegates ) delegate.delegates = {};

			this.template.n.forEach( n => {
				const fn = findInViewHierarchy( 'events', this.ractive, n );
				if ( fn ) {
					this.events.push( new CustomEvent( fn, this.element, n ) );
				} else {
					if ( delegate ) {
						if ( !delegate.delegates[n] ) {
							const ev = new DOMEvent( n, delegate );
							delegate.delegates[n] = ev;
							// if the element is already rendered, render the event too
							if ( delegate.rendered ) ev.listen( DelegateProxy );
						}
					} else {
						this.events.push( new DOMEvent( n, this.element ) );
					}
				}
			});
		}

		// method calls
		this.models = null;
	}

	bind () {
		addToArray( this.element.events, this );

		setupArgsFn( this, this.template );
		if ( !this.fn ) this.action = this.template.f;
	}

	destroyed () {
		this.events.forEach( e => e.unlisten() );
	}

	fire ( event, passedArgs = [] ) {
		const context = Object.create( this.getContextObject() );

		if ( event ) Object.assign( context, event );

		if ( this.fn ) {
			const values = [];

			const models = resolveArgs( this, this.template, this.parentFragment, {
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

			if ( models ) {
				models.forEach( model => {
					if ( !model ) return values.push( undefined );
					let obj;

					if ( model.special ) {
						switch ( model.special ) {
							case 'event':
								warnOnceIfDebug( `The special 'event' reference has been deprecated and replaced with '@context' and '@event'` );
								obj = context;
								break;
							case '@context':
								obj = context;
								break;
							case '@event':
								obj = event && event.event;
								break;
							case '@node':
								obj = this.element.node;
								break;
							default:
								obj = passedArgs;
								break;
						}

						const keys = model.keys.slice();

						while ( obj != null && keys.length ) obj = obj[ keys.shift() ];
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

			ractive.event = context;
			let result = this.fn.apply( ractive, values );
			const last = result.pop();

			// Auto prevent and stop if return is explicitly false
			if ( last === false ) {
				const original = event ? event.event : undefined;
				if ( original ) {
					original.preventDefault && original.preventDefault();
					original.stopPropagation && original.stopPropagation();
				} else {
					warnOnceIfDebug( `handler '${this.template.n.join( ' ' )}' returned false, but there is no event available to cancel` );
				}
			} else if ( !result.length && Array.isArray( last ) && typeof last[0] === 'string' ) {
				result = fireEvent( context, last.shift(), last );
			}

			ractive.event = oldEvent;

			return result;
		}

		else {
			return fireEvent( context, this.action, passedArgs );
		}
	}

	render () {
		// render events after everything else, so they fire after bindings
		runloop.scheduleTask( () => this.events.forEach( e => e.listen( this ), true ) );
	}

	toString() { return ''; }

	unbind () {
		removeFromArray( this.element.events, this );
	}

	unrender () {
		this.events.forEach( e => e.unlisten() );
	}
}

EventDirective.prototype.update = noop;
EventDirective.prototype.getContextObject = Item.prototype.getContextObject;
