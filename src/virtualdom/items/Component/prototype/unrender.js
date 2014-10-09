export default function Component$unrender ( shouldDestroy ) {

	this.shouldDestroy = shouldDestroy;
	this.instance.unrender();

	if ( shouldDestroy ) {
		this.instance.teardown();
	}
}
