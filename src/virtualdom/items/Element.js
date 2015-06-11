import { ELEMENT } from 'config/types';
import Item from './shared/Item';
import Fragment from '../Fragment';
import Attribute from './element/Attribute';
import { voidElementNames } from 'utils/html';
import { bind, render, update } from 'shared/methodCallers';
import { matches } from 'utils/dom';

export default class Element extends Item {
	constructor ( options ) {
		super( options );

		this.parentFragment = options.parentFragment;
		this.template = options.template;
		this.index = options.index;

		this.liveQueries = []; // TODO rare case. can we handle differently?

		this.isVoid = voidElementNames.test( options.template.e );

		this.attributes = this.template.a ?
			Object.keys( this.template.a ).map( name => {
				return new Attribute({
					name,
					element: this,
					template: this.template.a[ name ]
				})
			}) :
			[];

		if ( options.template.f ) {
			this.fragment = new Fragment({
				template: options.template.f,
				owner: this
			});
		}
	}

	bind () {
		this.attributes.forEach( bind );

		if ( this.fragment ) {
			this.fragment.bind();
		}
	}

	detach () {
		return this.node.parentNode.removeChild( this.node );
	}

	find ( selector ) {
		if ( matches( this.node, selector ) ) return this.node;
		return this.fragment.find( selector );
	}

	findAll ( selector, query ) {
		// Add this node to the query, if applicable, and register the
		// query on this element
		if ( query._test( this, true ) && query.live ) {
			this.liveQueries.push( query );
		}

		if ( this.fragment ) {
			this.fragment.findAll( selector, query );
		}
	}

	findNextNode () {
		return null;
	}

	firstNode () {
		return this.node;
	}

	render () {
		const node = document.createElement( this.template.e );
		this.node = node;

		if ( this.fragment ) {
			node.appendChild( this.fragment.render() );
		}

		this.attributes.forEach( render );

		return node;
	}

	toString () {
		const tagName = this.template.e;

		const attrs = this.attributes
			.map( attr => {
				return ` ${attr.toString()}`;
			})
			.join( '' );

		if ( this.isVoid ) {
			return `<${tagName}${attrs}>`;
		}

		const contents = this.fragment ?
			this.fragment.toString( !/^(?:script|style)$/i.test( this.template.e ) ) : // escape text unless script/style
			'';

		return `<${tagName}${attrs}>${contents}</${tagName}>`;
	}

	unbind () {
		if ( this.fragment ) {
			this.fragment.unbind();
		}
	}

	unrender ( shouldDestroy ) {
		if ( shouldDestroy ) {
			this.detach();
		}
	}

	update () {
		if ( this.dirty ) {
			this.attributes.forEach( update );

			if ( this.fragment ) {
				this.fragment.update();
			}

			this.dirty = false;
		}
	}
}
