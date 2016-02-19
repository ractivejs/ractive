import { removeFromArray } from '../../../utils/array';
import fireEvent from '../../../events/fireEvent';
import Fragment from '../../Fragment';
import getFunction from '../../../shared/getFunction';
import { unbind } from '../../../shared/methodCallers';
import resolveReference from '../../resolvers/resolveReference';
import { splitKeypath } from '../../../shared/keypaths';

const specialPattern = /^(event|arguments)(\..+)?$/;
const dollarArgsPattern = /^\$(\d+)(\..+)?$/;

export default class EventDirective {
	constructor ( owner, event, template ) {
		this.owner = owner;
		this.event = event;
		this.template = template;

		this.ractive = owner.parentFragment.ractive;
		this.parentFragment = owner.parentFragment;

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

		const template = this.template;

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
					});

					this.resolvers.push( resolver );
				}

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

		if ( this.template.n && typeof this.template.n !== 'string' ) this.action.bind();
		if ( this.template.d ) this.args.bind();
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.owner.bubble();
		}
	}

	fire ( event, passedArgs = [] ) {

		// augment event object
		if ( event ) {
			event.keypath = this.context.getKeypath( this.ractive );
			event.rootpath = this.context.getKeypath();
			event.context = this.context.get();
			event.index = this.parentFragment.indexRefs;
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
						return values.push( model.wrapper.value );
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
			let original;
			if ( result === false && ( original = event.original ) ) {
				original.preventDefault && original.preventDefault();
				original.stopPropagation && original.stopPropagation();
			}

			ractive.event = oldEvent;
		}

		else {
			const action = this.action.toString();
			let args = this.template.d ? this.args.getArgsList() : this.args;

			if ( passedArgs.length ) args = args.concat( passedArgs );

			if ( event ) event.name = action;

			fireEvent( this.ractive, action, {
				event,
				args
			});
		}
	}

	rebind () {
		this.unbind();
		this.bind();
	}

	render () {
		this.event.listen( this );
	}

	unbind () {
		if ( this.resolvers ) this.resolvers.forEach( unbind );
		if ( this.action && this.action.unbind ) this.action.unbind();
		if ( this.args && this.args.unbind ) this.args.unbind();
	}

	unrender () {
		this.event.unlisten();
	}

	update () {
		// ugh legacy
		if ( this.action && this.action.update ) this.action.update();
		if ( this.args && this.args.update ) this.args.update();

		this.dirty = false;
	}
}
