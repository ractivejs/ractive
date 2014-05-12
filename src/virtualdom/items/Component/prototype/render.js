export default function Component$render () {
	var instance = this.instance;

	instance.render( this.parentFragment.getNode() ).then( function () {
		if ( instance.initOptions.complete ) {
			instance.initOptions.complete.call( instance );
		}
	});

	this.rendered = true;
	return instance.detach();
}
