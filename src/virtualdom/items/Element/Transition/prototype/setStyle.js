import prefix from '../helpers/prefix';

export default function ( style, value ) {
	var prop;

	if ( typeof style === 'string' ) {
		this.node.style[ prefix( style ) ] = value;
	}

	else {
		for ( prop in style ) {
			if ( style.hasOwnProperty( prop ) ) {
				this.node.style[ prefix( prop ) ] = style[ prop ];
			}
		}
	}

	return this;
}
