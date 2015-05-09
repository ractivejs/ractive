import BindingContext from './BindingContext';
import DataStore from '../stores/DataStore';

class RootContext extends BindingContext {
	constructor ( viewmodel, data ) {
		super( '', new DataStore( data ) );
		this.owner = viewmodel;
		this.isRoot = true;
	}

	getKeypath () {
		return '';
	}
}

export default RootContext;
