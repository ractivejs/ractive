export default function Fragment$unrender ( shouldDestroy ) {
	this.items.forEach( i => i.unrender( shouldDestroy ) );
}
