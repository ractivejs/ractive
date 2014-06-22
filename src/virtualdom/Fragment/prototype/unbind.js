export default function Fragment$unbind () {
	this.items.forEach( unbindItem );
}

function unbindItem ( item ) {
	if ( item.unbind ) {
		item.unbind();
	}
}
