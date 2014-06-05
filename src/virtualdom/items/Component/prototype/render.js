export default function Component$render () {

	var instance = this.instance;

	instance.render( this.parentFragment.getNode() ).then( function () {

		var complete;

		if ( complete = instance.complete ) {
			complete.call( instance );
		}

	});

	this.rendered = true;
	return instance.detach();
}
