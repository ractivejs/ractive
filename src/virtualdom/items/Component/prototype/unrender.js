export default function Component$unrender ( shouldDestroy ) {
	this.shouldDestroy = shouldDestroy;
	this.instance.unrender();
}
