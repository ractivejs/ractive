import { SECTION, SECTION_UNLESS } from 'config/types';
import Mustache from 'virtualdom/items/shared/Mustache/_Mustache';

import bubble from './prototype/bubble';
import detach from './prototype/detach';
import find from './prototype/find';
import findAll from './prototype/findAll';
import findAllComponents from './prototype/findAllComponents';
import findComponent from './prototype/findComponent';
import findNextNode from './prototype/findNextNode';
import firstNode from './prototype/firstNode';
import shuffle from './prototype/shuffle';
import rebind from './prototype/rebind';
import render from './prototype/render';
import setValue from './prototype/setValue';
import toString from './prototype/toString';
import unbind from './prototype/unbind';
import unrender from './prototype/unrender';
import update from './prototype/update';

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
