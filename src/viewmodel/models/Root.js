import Model from './Model';
import DataStore from '../stores/DataStore';

class Root extends Model {
	constructor ( viewmodel, data ) {
		super( '', new DataStore( data ) );
		this.owner = viewmodel;
		this.isRoot = true;
	}

	getKeypath () {
		return '';
	}
}

export default Root;
