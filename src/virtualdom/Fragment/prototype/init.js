import { ensureArray } from 'utils/array';
import createItem from './init/createItem';

export default function Fragment$init ( options ) {

	var parentFragment;

	// The item that owns this fragment - an element, section, partial, or attribute
	this.owner = options.owner;
	parentFragment = this.parent = this.owner.parentFragment;

	// inherited properties
	this.root = options.root;
	this.pElement = options.pElement;
	this.context = options.context;
	this.index = options.index;
	this.key = options.key;
	this.registeredIndexRefs = [];

	// Time to create this fragment's child items

	// TODO should this be happening?
	options.template = ensureArray( options.template );

	this.items = options.template.map( ( template, i ) => createItem({
		parentFragment: this,
		pElement: options.pElement,
		template: template,
		index: i
	}) ).filter( i => i !== null );

	this.value = this.argsList = null;
	this.dirtyArgs = this.dirtyValue = true;

	this.bound = true;
}
