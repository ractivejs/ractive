export default function Section$unrender ( shouldDestroy ) {
	this.fragments.forEach( shouldDestroy ? unrenderAndDestroy : unrender );
	this.renderedFragments = [];
	this.rendered = false;
}

function unrenderAndDestroy ( fragment ) {
	fragment.unrender( true );
}

function unrender ( fragment ) {
	fragment.unrender( false );
}
