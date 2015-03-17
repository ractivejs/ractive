import Model from './Model';
import ReferenceStore from '../stores/ReferenceStore';
import { addToArray, removeFromArray } from 'utils/array';

class ReferenceModel extends Model {

	constructor ( key, reference, parent ) {

		var store = new ReferenceStore( reference, this );

		super( '[' + key + ']', store );

		this.reference = reference;
		this.resolved = null;

		reference.register( this, 'computed' );
	}

}

export default ReferenceModel;
