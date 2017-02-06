import { doc } from '../../../config/environment';

export default function progressiveText ( item, target, occupants, text ) {
	if ( occupants ) {
		let n = occupants[0];
		if ( n && n.nodeType === 3 ) {
			const idx = n.nodeValue.indexOf( text );
			occupants.shift();

			if ( idx === 0 ) {
				if ( n.nodeValue.length !== text.length ) {
					occupants.unshift( n.splitText( text.length ) );
				}
			} else {
				n.nodeValue = text;
			}
		} else {
			n = item.node = doc.createTextNode( text );
			if ( occupants[0] ) {
				target.insertBefore( n, occupants[0] );
			} else {
				target.appendChild( n );
			}
		}

		item.node = n;
	} else {
		if ( !item.node ) item.node = doc.createTextNode( text );
		target.appendChild( item.node );
	}
}
