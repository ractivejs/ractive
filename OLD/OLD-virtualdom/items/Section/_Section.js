import Fragment from '../../Fragment';
import { initialiseMustache } from '../shared/Mustache';
import { isArray, isObject } from 'utils/is';

function unrenderAndDestroy ( fragment ) {
	fragment.unrender( true );
}

function unrender ( fragment ) {
	fragment.unrender( false );
}

const EACH = 'each';
const WITH = 'with';
const IF = 'if';

export default class Section {
	constructor ( options ) {
		this.fragments = [];
		this.length = 0;
		this.docFrag = null;
		this.sectionType = null;

		initialiseMustache( this, options );
	}

	checkType ( value ) {
		console.log( 'checking sectionType', value )
		// TODO don't allow section to change sectionType
		console.log( 'this.sectionType', this.sectionType )
		if ( this.sectionType === null ) {
			console.log( 'um' )
			if ( isArray( value ) ) {
				console.log( 'is array' )
				this.sectionType = EACH;
			} else if ( isObject( value ) ) {
				this.sectionType = WITH;
			} else if ( value !== undefined ) {
				this.sectionType = IF;
			}
		}
	}

	render () {
		const docFrag = document.createDocumentFragment();
		const fragments = this.fragments;

		for ( var i = 0, len = fragments.length; i < len; i++ ) {
			docFrag.appendChild( fragments[i].render() );
		}

		this.rendered = true;
		return ( this.docFrag = docFrag );
	}

	setValue () {
		const value = this.context.value;

		this.checkType( value );

		console.log( 'this', this )

		if ( this.sectionType === EACH ) {
			while ( this.fragments.length < value.length ) {
				const fragment = new Fragment({
					template: this.template.f || [], // TODO optimise for empties
					root:     this.root,
					pElement: this.parentFragment.pElement,
					owner:    this
				});

				this.fragments.push( fragment );
				console.log( 'fragment', fragment )
			}
		}
	}

	unrender ( shouldDestroy ) {
		this.fragments.forEach( shouldDestroy ? unrenderAndDestroy : unrender );
		this.renderedFragments = [];
		this.rendered = false;
	}
}
