export default function ( nodeOrComponent ) {
	var index = this.indexOf( this._isComponentQuery ? nodeOrComponent.instance : nodeOrComponent );

	if ( index !== -1 ) {
		this.splice( index, 1 );
	}
}
