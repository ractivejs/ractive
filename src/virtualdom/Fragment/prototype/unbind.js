export default function Fragment$unbind () {
	if ( !this.bound ) {
		return;
	}

	this.items.forEach( unbindItem );
	this.bound = false;
}

function unbindItem ( item ) {
	if ( item.unbind ) {
		item.unbind();
	}
}
