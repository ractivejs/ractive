export default function Component$unrender ( shouldDestroy ) {
	this.instance.fire( 'teardown' );

	this.shouldDestroy = shouldDestroy;
	this.instance.unrender();
}
