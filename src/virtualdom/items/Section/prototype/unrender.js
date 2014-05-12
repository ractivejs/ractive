export default function Section$unrender ( shouldDestroy ) {
	this.fragments.forEach( f => f.unrender( shouldDestroy ) );
}
