import { COMPONENT } from '../../../config/types';
import { removeFromArray } from '../../../utils/array';
import fireEvent from '../../../events/fireEvent';
import Fragment from '../../Fragment';
import getFunction from '../../../shared/getFunction';
import { unbind } from '../../../shared/methodCallers';
import resolveReference from '../../resolvers/resolveReference';
import { splitKeypath } from '../../../shared/keypaths';
import findElement from './findElement';
import { findInViewHierarchy } from '../../../shared/registry';
import { DOMEvent, CustomEvent } from '../element/ElementEvents';
import RactiveEvent from '../component/RactiveEvent';
import runloop from '../../../global/runloop';
import { addHelpers } from '../../helpers/contextMethods';
import { warnOnceIfDebug } from '../../../utils/log';

const specialPattern = /^(event|arguments)(\..+)?$/;
const dollarArgsPattern = /^\$(\d+)(\..+)?$/;

export default class EventDirective {
	constructor ( options ) {
		this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
		this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment );
		this.template = options.template;
		this.parentFragment = options.parentFragment;
		this.ractive = options.parentFragment.ractive;

		this.events = [];

		if ( this.element.type === COMPONENT ) {
			this.template.n.split( '-' ).forEach( n => {
				this.events.push( new RactiveEvent( this.element.instance, n ) );
			});
		} else {
			this.template.n.split( '-' ).forEach( n => {
				const fn = findInViewHierarchy( 'events', this.ractive, n );
				// we need to pass in "this" in order to get
				// access to node when it is created.
				this.events.push(fn ? new CustomEvent( fn, this.element ) : new DOMEvent( n, this.element ));
			});
		}

		this.context = null;

		// method calls
		this.resolvers = null;
		this.models = null;

		// handler directive
		this.action = null;
		this.args = null;
	}

	bind () {
		this.context = this.parentFragment.findContext();

		const template = this.template.f;

		if ( template.x ) {
			this.fn = getFunction( template.x.s, template.x.r.length );
			this.resolvers = [];
			this.models = template.x.r.map( ( ref, i ) => {
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

				let resolver;

				const model = resolveReference( this.parentFragment, ref );
				if ( !model ) {
					resolver = this.parentFragment.resolve( ref, model => {
						this.models[i] = model;
						removeFromArray( this.resolvers, resolver );
						model.register( this );
					});

					this.resolvers.push( resolver );
				} else model.register( this );

				return model;
			});
		}

		else {
			// TODO deprecate this style of directive
			this.action = typeof template === 'string' ? // on-click='foo'
				template :
				typeof template.n === 'string' ? // on-click='{{dynamic}}'
					template.n :
					new Fragment({
						owner: this,
						template: template.n
					});

			this.args = template.a ? // static arguments
				( typeof template.a === 'string' ? [ template.a ] : template.a ) :
				template.d ? // dynamic arguments
					new Fragment({
						owner: this,
						template: template.d
					}) :
					[]; // no arguments
		}

		if ( this.action && typeof this.action !== 'string' ) this.action.bind();
		if ( this.args && template.d ) this.args.bind();
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
			let values = [];

			if ( event ) passedArgs.unshift( event );

			if ( this.models ) {
				this.models.forEach( model => {
					if ( !model ) return values.push( undefined );

					if ( model.special ) {
						let obj = model.special === 'event' ? event : passedArgs;
						let keys = model.keys.slice();

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
					warnOnceIfDebug( `handler '${this.template.n}' returned false, but there is no event available to cancel` );
				}
			}

			ractive.event = oldEvent;
		}

		else {
			const action = this.action.toString();
			let args = this.template.f.d ? this.args.getArgsList() : this.args;

			if ( passedArgs.length ) args = args.concat( passedArgs );

			if ( event ) event.name = action;

			fireEvent( this.ractive, action, {
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
		const template = this.template.f;

		if ( template.m ) {
			if ( this.resolvers ) this.resolvers.forEach( unbind );
			this.resolvers = [];

			if ( this.models ) this.models.forEach( m => {
				if ( m.unregister ) m.unregister( this );
			});
			this.models = null;
		}

		else {
			// TODO this is brittle and non-explicit, fix it
			if ( this.action && this.action.unbind ) this.action.unbind();
			if ( this.args && this.args.unbind ) this.args.unbind();
		}
	}

	unrender () {
		this.events.forEach( e => e.unlisten() );
	}

	update () {
		if ( this.method || !this.dirty ) return; // nothing to do

		this.dirty = false;

		// ugh legacy
		if ( this.action && this.action.update ) this.action.update();
		if ( this.args && this.args.update ) this.args.update();
	}
}
