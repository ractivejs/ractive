import Model from './Model';
import { ReferenceStore } from './store';
import { addToArray, removeFromArray } from 'utils/array';

class ReferenceModel extends Model {

	constructor ( reference, parent ) {

		var store = new ReferenceStore( reference, parent );

		super( '[' + reference.key + ']', store );

		parent.addChild(this);
		reference.register( this, 'computed' );
	}

}

export default ReferenceModel;
