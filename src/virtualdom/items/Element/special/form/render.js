import handleReset from 'virtualdom/items/Element/special/form/handleReset';

export default function renderForm ( element ) {
	element.node.addEventListener( 'reset', handleReset, false);
}