import { isEqual } from '../../../utils/is';
import { removeFromArray } from '../../../utils/array';
import runloop from '../../../global/runloop';
import { rebindMatch } from '../../../shared/rebind';

export default class Observer {
	constructor ( ractive, model, callback, options ) {
		this.context = options.context || ractive;
		this.callback = callback;
		this.ractive = ractive;

		if ( model ) this.resolved( model );

		this.options = options;

		if ( typeof options.old === 'function' ) {
			this.oldContext = Object.create( ractive );
			this.old = options.old;
		} else {
			this.old = old;
		}

		if ( options.init !== false ) {
			this.dirty = true;
			this.dispatch();
		} else {
			this.oldValue = this.old.call( this.oldContext, undefined, this.newValue );
		}

		this.dirty = false;
	}

	cancel () {
		this.cancelled = true;
		if ( this.model ) {
			this.model.unregister( this );
		}
		removeFromArray( this.ractive._observers, this );
	}

	dispatch () {
		if ( !this.cancelled ) {
			this.callback.call( this.context, this.newValue, this.oldValue, this.keypath );
			this.oldValue = this.old.call( this.oldContext, this.oldValue, this.model ? this.model.get() : this.newValue );
			this.dirty = false;
		}
	}

	handleChange () {
		if ( !this.dirty ) {
			const newValue = this.model.get();
			if ( isEqual( newValue, this.oldValue ) ) return;

			this.newValue = newValue;

			if ( this.options.strict && this.newValue === this.oldValue ) return;

			runloop.addObserver( this, this.options.defer );
			this.dirty = true;

			if ( this.options.once ) runloop.scheduleTask( () => this.cancel() );
		}
	}

	rebind ( next, previous ) {
		next = rebindMatch( this.keypath, next, previous );
		if ( next === this.model ) return false;

		if ( this.model ) this.model.unregister( this );
		if ( next ) next.addShuffleTask( () => this.resolved( next ) );
	}

	resolved ( model ) {
		this.model = model;
		this.keypath = model.getKeypath( this.ractive );

		this.oldValue = undefined;
		this.newValue = model.get();

		model.register( this );
	}
}

function old ( previous, next ) {
	return next;
}
