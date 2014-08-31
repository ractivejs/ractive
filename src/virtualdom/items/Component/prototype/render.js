export default function Component$render () {
	var instance = this.instance;

	instance.render( this.parentFragment.getNode() );

	this.rendered = true;
	return instance.fragment.detach();
}
