import Model from './Model';
import DataStore from '../stores/DataStore';

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
