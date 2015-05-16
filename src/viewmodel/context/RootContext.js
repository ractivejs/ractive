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

	get ( options ) {
		const value = super.get();

		if ( options && options.fullRootGet ) {
			const properties = this.propertyHash, keys = Object.keys( properties );
			let key, property;

			for ( let i = 0, l = keys.length; i < l; i++ ) {
				key = keys[i];
				property = properties[ key ];

				if ( property.owner !== this.owner ) {
					value[ key ] = property.get();
				}
			}
		}

		return value;
	}
}

export default RootContext;
