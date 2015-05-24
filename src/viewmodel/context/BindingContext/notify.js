import Dependants from './Dependants';

export function register ( method, dependant, noInit ) {
	const dependants = this.dependants || ( this.dependants = new Dependants() );

	dependants.add( method, dependant );

	if ( noInit ) {
		return;
	}

	switch ( method ) {
		case 'mark':
			break;
		case 'updateMembers':
			this.getOrCreateMembers();
			break;
		case 'setValue':
			const value = this.get();
			if ( value != null && value !== '' ) {
				dependant.setValue( value );
			}
			break;
		case 'setMembers':
			const members = this.getOrCreateMembers();
			if ( members.length ) {
				dependant.setMembers( members );
			}
			break;
		default:
			throw new Error(`Unrecognized method "${method}" on register( method, dependant ) call`);
	}
}

export function unregister ( method, dependant ) {
	const dependants = this.dependants;

	if ( dependants ) {
		dependants.remove( method, dependant );
	}

	// TODO: Would it make sense to set
	// this.members = null if no more list dependants?
}

export function notify () {

	if( !this.dirty ) {
		return;
	}

	const dependants = this.dependants;

	if ( dependants ) {
		if ( dependants.has( 'setValue') ) {
			dependants.notify( 'setValue', this.get() );
		}

		const shuffled = this.shuffled;

		if ( shuffled ) {
			dependants.notify( 'updateMembers', shuffled );
		}
		else if ( dependants.has( 'setMembers') ) {
			const members = this.getOrCreateMembers();
			if ( members ) {
				dependants.notify( 'setMembers', members );
			}
		}
	}

	this.dirty = false;
	this.shuffled = null;
	this.notifyChildren( this.members );
	this.notifyChildren( this.properties );
}

export function notifyChildren ( children, type ) {
	let i, l, child;

	if ( !children ) {
		return;
	}

	for( i = 0, l = children.length; i < l; i++ ) {
		child = children[i];
		if ( child.dirty ) {
			child.notify( type );
		}
	}
}
