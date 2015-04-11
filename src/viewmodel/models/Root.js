import Context from './Context';
import DataStore from '../stores/DataStore';

class Root extends Context {
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
