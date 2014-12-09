import handleReset from 'virtualdom/items/Element/special/form/handleReset';

export default function unrenderForm ( element ) {
	element.node.removeEventListener( 'reset', handleReset, false);
}