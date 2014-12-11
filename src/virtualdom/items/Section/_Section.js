import { SECTION, SECTION_UNLESS } from 'config/types';
import Mustache from 'virtualdom/items/shared/Mustache/_Mustache';

import bubble from 'virtualdom/items/Section/prototype/bubble';
import detach from 'virtualdom/items/Section/prototype/detach';
import find from 'virtualdom/items/Section/prototype/find';
import findAll from 'virtualdom/items/Section/prototype/findAll';
import findAllComponents from 'virtualdom/items/Section/prototype/findAllComponents';
import findComponent from 'virtualdom/items/Section/prototype/findComponent';
import findNextNode from 'virtualdom/items/Section/prototype/findNextNode';
import firstNode from 'virtualdom/items/Section/prototype/firstNode';
import shuffle from 'virtualdom/items/Section/prototype/shuffle';
import rebind from 'virtualdom/items/Section/prototype/rebind';
import render from 'virtualdom/items/Section/prototype/render';
import setValue from 'virtualdom/items/Section/prototype/setValue';
import toString from 'virtualdom/items/Section/prototype/toString';
import unbind from 'virtualdom/items/Section/prototype/unbind';
import unrender from 'virtualdom/items/Section/prototype/unrender';
import update from 'virtualdom/items/Section/prototype/update';

var Section = function ( options ) {
	this.type = SECTION;
	this.subtype = this.currentSubtype = options.template.n;
	this.inverted = this.subtype === SECTION_UNLESS;


	this.pElement = options.pElement;

	this.fragments = [];
	this.fragmentsToCreate = [];
	this.fragmentsToRender = [];
	this.fragmentsToUnrender = [];

	if ( options.template.i ) {
		this.indexRefs = options.template.i.split(',').map( ( k, i ) => {
			return { n: k, t: i === 0 ? 'k' : 'i' };
		});
	}

	this.renderedFragments = [];

	this.length = 0; // number of times this section is rendered

	Mustache.init( this, options );
};

Section.prototype = {
	bubble: bubble,
	detach: detach,
	find: find,
	findAll: findAll,
	findAllComponents: findAllComponents,
	findComponent: findComponent,
	findNextNode: findNextNode,
	firstNode: firstNode,
	getIndexRef: function( name ) {
		if ( this.indexRefs ) {
			let i = this.indexRefs.length;
			while ( i-- ) {
				let ref = this.indexRefs[i];
				if ( ref.n === name ) {
					return ref;
				}
			}
		}
	},
	getValue: Mustache.getValue,
	shuffle: shuffle,
	rebind: rebind,
	render: render,
	resolve: Mustache.resolve,
	setValue: setValue,
	toString: toString,
	unbind: unbind,
	unrender: unrender,
	update: update
};

export default Section;
