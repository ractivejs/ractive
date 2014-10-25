import runloop from 'global/runloop';

export default function Attribute$updateRadioValue () {
	var wasChecked, node = this.node, binding, bindings, i;

	wasChecked = node.checked;

	node.value = this.element.getAttribute( 'value' );
	node.checked = this.element.getAttribute( 'value' ) === this.element.getAttribute( 'name' );

	// This is a special case - if the input was checked, and the value
	// changed so that it's no longer checked, the twoway binding is
	// most likely out of date. To fix it we have to jump through some
	// hoops... this is a little kludgy but it works
	if ( wasChecked && !node.checked && this.element.binding ) {
		bindings = this.element.binding.siblings;

		if ( i = bindings.length ) {
			while ( i-- ) {
				binding = bindings[i];

				if ( !binding.element.node ) {
					// this is the initial render, siblings are still rendering!
					// we'll come back later...
					return;
				}

				if ( binding.element.node.checked ) {
					runloop.addViewmodel( binding.root.viewmodel );
					return binding.handleChange();
				}
			}

			this.root.viewmodel.set( binding.keypath, undefined );
		}
	}
}
