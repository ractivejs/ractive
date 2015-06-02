export default function Fragment$render () {
	var result;
	
	if ( this.items.length === 1 ) {
		result = this.items[0].render();
	} else {
		result = document.createDocumentFragment();
		if(!this.parent||this.owner.value)
			this.items.forEach( item => {
				result.appendChild( item.render() );
			});
	}

	this.rendered = true;
	return result;
}
