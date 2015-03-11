import Model from './Model';
import { ReferenceStore } from './store';
import { addToArray, removeFromArray } from 'utils/array';

class ReferenceModel extends Model {

	constructor ( key, reference, parent ) {

		var store = new ReferenceStore( reference, parent );

		super( '[' + key + ']', store );

		parent.addChild(this);
		reference.register( this, 'computed' );
	}
}

export default ReferenceModel;
