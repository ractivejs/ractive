import Model from './Model';
import { DataStore } from './store';

class RootModel extends Model {
	constructor ( viewmodel, data ) {
		super( '', new DataStore( data ) );
		this.owner = viewmodel;
		this.isRoot = true;
		this.startContext();
	}

	getKeypath () {
		return '';
	}
}

export default RootModel;
