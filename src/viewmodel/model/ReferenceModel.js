import ProxyModel from './ProxyModel';
import { addToArray, removeFromArray } from 'utils/array';

class ReferenceModel extends ProxyModel {

	constructor ( reference ) {

		super( '[' + reference.key + ']' );

		this.childReferences = null;
		this.value = null;
		this.reference = reference;
		reference.addChild( this );
	}

	addChildReference ( child ) {
		( this.childReferences || ( this.childReferences = [] ) ).push( child );
	}

	reevaluate () {
		var children, realModel;

		if ( this.value != null ) {
			this.realModel = this.parent.join( this.value );
		} else {
			this.realModel = null
		}

		if ( children = this.childReferences ) {
			for( var i = 0, l = children.length; i < l; i++ ) {
				children[ i ].reevaluate();
			}
		}
	}

	mark () {
		throw new Error( 'mark' );
	}

	cascade () {
		this.value = this.reference.get();
		this.reevaluate();
	}

	register ( dependant, type = 'default' ) {

		if ( type === 'default' ) {
			var dependants = this.dependants || ( this.dependants = {} ), group;

			if( group = dependants[ type ] ) {
				group.push( dependant );
			}
			else {
				dependants[ type ] = [ dependant ];
			}
		}
		else {
			if ( this.realModel ) {
				return this.realModel.register( dependant, type );
			}

			( this.dependants || ( this.dependants = [] ) ).push({
				type: type,
				dependant: dependant
			});
		}
	}

	notify ( type ) {

		var dependants, group, value, children, i, l;

		// ignore non-default notify though I suppose you could observe
		if ( type === 'default' ) {
			if( ( dependants = this.dependants ) && ( group = dependants[ type ] ) ) {
				value = this.get();
				for( i = 0, l = group.length; i < l; i++ ) {
					group[i].setValue( value );
				}
			}
		}
	}

}

export default ReferenceModel;
