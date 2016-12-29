import { ELEMENT, COMPONENT, PARTIAL, YIELDER, SECTION, INVERTED, INTERPOLATOR, ANCHOR, ALIAS, TRIPLE, ATTRIBUTE, EVENT, DECORATOR, BINDING_FLAG, TRANSITION } from '../../config/types';
import { SECTION_IF, SECTION_IF_WITH, SECTION_EACH, SECTION_UNLESS } from '../../config/types';

class Template {
	constructor ( fragment, owner ) {
		if ( !fragment ) fragment = [];
		if ( fragment.t ) {
			this.expressions = fragment.e;
			fragment = fragment.t;
		}
		this.owner = owner;

		// start the root with a defensive copy so that any modifications don't affect other instances later
		this.fragment = !owner ? JSON.parse( JSON.stringify( fragment ) ) : fragment;
	}

	get content () {
		return this.fragment.map( i => {
			if ( typeof i === 'string' ) return new Text( i, this );

			switch ( i.t ) {
				case ELEMENT:
				case COMPONENT:
				case ANCHOR:
					return new Element( i, this );
				case PARTIAL:
				case INTERPOLATOR:
				case TRIPLE:
				case YIELDER:
					return new Inline( i, this );
				case SECTION:
				case INVERTED:
				case ALIAS:
					return new Block( i, this );
				case ATTRIBUTE:
				case BINDING_FLAG:
				case DECORATOR:
				case EVENT:
				case TRANSITION:
					return new Attribute( i, this );
			}
		});
	}

	get elements () { return this.content.filter( i => i instanceof Element ); }

	get root () {
		if ( !this.owner ) return this;
		return this.owner.root;
	}

	// clone this bit of template as a new base template
	toTemplate () {
		return { e: this.root.e, t: this.item ? [ this.item ] : this.fragment };
	}
}

class Text extends Template {
	get content () { return []; }
}

class Element extends Template {
	constructor ( item, owner ) {
		super( item.f, owner );
		this.item = item;
	}

	get attributes () { return this.attributeFragment.content.filter( i => i.isAttribute ); }
	get attributeContent () { return this.attributeFragment.content; }
	get events () { return this.attributeFragment.content.filter( i => i.isEvent ); }
	get decorators () { return this.attributeFragment.content.filter( i => i.isDecorator ); }
	get bindingFlags () { return this.attributeFragment.content.filter( i => i.isBindingFlag ); }
	get transitions () { return this.attributeFragment.content.filter( i => i.isTransition ); }
	get partials () {
		const list = [];
		if ( this.item.p ) {
			for ( const name in this.item.p ) {
				const fragment = this.item.p[name];
				const partial = new Partial( name, fragment, this );
				list.push( partial );
				list[ name ] = partial;
			}
		}
		return list;
	}

	get attributeFragment () {
		return new Template( this.item.m || [], this );
	}

	get isAnchor () { return this.item.t === ANCHOR; }

	get name () { return this.item.e; }
	set name ( name ) { this.item.e = name; }

	remove () {
		this.owner.fragment.splice( this.owner.fragment.indexOf( this.item ), 1 )[0];
		return this;
	}
}

class Attribute extends Template {
	constructor ( item, owner ) {
		super( typeof item.f === 'string' ? [] : item.f, owner );
		if ( typeof item.f === 'string' ) this.text = item.f;
		this.item = item;
	}

	get isAttribute () { return this.item.t === ATTRIBUTE; }
	get isEvent () { return this.item.t === EVENT; }
	get isDecorator () { return this.item.t === DECORATOR; }
	get isBindingFlag () { return this.item.t === BINDING_FLAG; }
	get isTransition () { return this.item.t === TRANSITION; }

	get name () { return this.item.n; }
	set name ( name ) { return this.item.n = name; }

	remove () {
		const owner = this.owner.item ? this.owner.item.m || [] : this.owner.fragment;
		owner.splice( owner.indexOf( this.item ), 1 );
		return this;
	}
}

class Block extends Template {
	constructor ( item, owner ) {
		super( item.f, owner );
		this.item = item;
	}

	get isAlias () { return this.item.t === ALIAS; }
	get isEach () { return this.item.t === SECTION && this.item.n === SECTION_EACH; }
	get isIf () { return this.item.t === SECTION && this.item.n === SECTION_IF; }
	get isPlain () { return this.item.t === SECTION && !this.item.n; }
	get isUnless () { return this.item.t === INVERTED || ( this.item.t === SECTION && this.item.n === SECTION_UNLESS ); }
	get isWith () { return this.item.t === SECTION && this.item.n === SECTION_IF_WITH; }

	get isStatic () { return this.item.s; }
}

class Inline extends Template {
	constructor ( item, owner ) {
		super( [], owner );
		this.item = item;
	}

	get isExpression () { return this.item.f && this.item.f.x; }
	get isInterpolator () { return this.item.t === INTERPOLATOR; }
	get isPartial () { return this.item.t === PARTIAL; }
	get isReference () { return this.item.f && this.item.f.r; }
	get isStatic () { return this.item.s; }
	get isUnescaped () { return this.item.t === TRIPLE; }
	get isYielder () { return this.item.t === YIELDER; }
}

class Partial extends Template {
	constructor ( name, fragment, owner ) {
		super( fragment, owner );
		this.name = name;
	}
}

export default function readTemplate ( template ) {
	return new Template( template );
}
