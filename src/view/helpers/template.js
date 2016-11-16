import { ELEMENT, COMPONENT, PARTIAL, YIELDER, SECTION, INVERTED, INTERPOLATOR, ANCHOR, ALIAS, TRIPLE, ATTRIBUTE, EVENT, DECORATOR, BINDING_FLAG, TRANSITION } from '../../config/types';
import { SECTION_IF, SECTION_IF_WITH, SECTION_EACH, SECTION_UNLESS } from '../../config/types';

const delimiters = {
	static:       [ '[[', ']]' ],
	staticTriple: [ '[[[', ']]]' ],
	plain:        [ '{{', '}}' ],
	triple:       [ '{{{', '}}}' ]
};

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

	// stringify a template
	toString ( options = {} ) {
		// some attributes have an expression as their fragment
		if ( this.fragment.s ) {
			const list = refToString({ x: this.fragment });
			return list.substring( 1, list.length - 1 );
		}
		return this.content.map( i => i.toString( options ) ).join( '' );
	}

	// clone this bit of template as a new base template
	toTemplate () {
		return { e: this.root.e, t: this.item ? [ this.item ] : this.fragment };
	}
}

class Text extends Template {
	get content () { return []; }

	toString () {
		return this.fragment;
	}
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

	toString ( options = {} ) {
		return `<${this.item.e}${this.attributeFragment.toString(options)}>${this.item.p ? this.partials.map(p => p.toString(options)).join('') : ''}${super.toString(options)}</${this.item.e}>`;
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

	toString ( options ) {
		const name = this.isTransition ?
			this.name + ( this.item.v === 't0' ? '-in-out' : this.item.v === 't1' ? '-in' : '-out' ) :
			this.isDecorator ? `as-${this.name}` :
			this.isEvent ? `on-${this.item.n.map(n => n.replace( /-/g, '\\-' )).join( '-' )}` :
			this.name;
		return ` ${name}="${this.text ? this.text : ''}${super.toString(options)}"`;
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

	toString ( options = {} ) {
		const delims = !this.isStatic ?
			options.delimiters || delimiters.plain :
			options.staticDelimiters || delimiters.static;
		const tag = this.isIf ? ( this.item.l ? 'elseif' : 'if' ) : this.isAlias || this.isWith ? 'with' : this.isUnless ? ( this.item.l ? 'else' : 'unless' ) : this.isEach ? 'each' : '';

		return `${delims[0]}${tag !== 'else' && tag !== 'elseif' ? '#' : ''}${tag ? `${tag} ` : ''}${refToString(this.item)}${this.item.z && this.item.z.length ? ( this.isAlias ? '' : ' ' ) + aliasesToString(this.item) : ''}${this.item.i ? `:${this.item.i}` : ''}${delims[1]}${super.toString(options)}${delims[0]}/${tag}${delims[1]}`;
	}
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

	toString ( options = {} ) {
		const delims = !this.isStatic && !this.isUnescaped ?
			( options.delimiters || delimiters.plain ) :
			!this.isStatic && this.isUnescaped ?
			( options.tripleDelimiters || delimiters.triple ) :
			this.isStatic && !this.isUnescaped ?
			( options.staticDelimiters || delimiters.static ) :
			( options.staticTripleDelimiters || delimiters.staticTriple );

		return `${delims[0]}${this.isPartial ? '> ' : this.isYielder ? 'yield ' : ''}${refToString(this.item)}${this.isPartial && this.item.c ? ` ${refToString(this.item.c)}` : ''}${this.item.z ? ` ${this.isYielder ? ' with ' : ' '}${aliasesToString(this.item)}` : ''}${delims[1]}`;
	}
}

class Partial extends Template {
	constructor ( name, fragment, owner ) {
		super( fragment, owner );
		this.name = name;
	}

	toString ( options = {} ) {
		const delims = options.delimiters || delimiters.plain;
		return `${delims[0]}#partial ${this.name}${delims[1]}${super.toString(options)}${delims[0]}/partial${delims[1]}`;
	}
}

function refToString ( item ) {
	if ( item.r ) return item.r;
	else if ( item.rx ) return `${item.r}${item.m.map(r => `[${r}]`).join('')}`;
	else if ( item.x ) return item.x.r.reduce( ( a, c, i ) => a.replace( `_${i}`, c ), item.x.s );
	else return '';
}

function aliasesToString ( item ) {
	if ( item.z ) return item.z.reduce( ( a, c ) => `${a}${a ? ', ' : ''}${refToString(c.x)} as ${c.n}`, '' );
	else return '';
}

export default function readTemplate ( template ) {
	return new Template( template );
}
