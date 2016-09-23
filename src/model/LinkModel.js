import ModelBase, { fireShuffleTasks } from './ModelBase';
import KeypathModel from './specials/KeypathModel';
import { capture } from '../global/capture';
import { handleChange, marked, notifiedUpstream, teardown } from '../shared/methodCallers';
import { rebindMatch } from '../shared/rebind';
import resolveReference from '../view/resolvers/resolveReference';
import noop from '../utils/noop';

// temporary placeholder target for detached implicit links
const missing = {
	key: '@missing',
	animate: noop,
	applyValue: noop,
	get: noop,
	getKeypath () { return this.key; },
	joinAll () { return this; },
	joinKey () { return this; },
	mark: noop,
	shufle: noop,
	set: noop,
	unregisterLink: noop
};
missing.parent = missing;

export default class LinkModel extends ModelBase {
	constructor ( parent, owner, target, key ) {
		super( parent );

		this.owner = owner;
		this.target = target;
		this.key = key === undefined ? owner.key : key;
		if ( owner.isLink ) this.sourcePath = `${owner.sourcePath}.${this.key}`;

		target.registerLink( this );

		this.isReadonly = parent.isReadonly;

		this.isLink = true;
	}

	animate ( from, to, options, interpolator ) {
		this.target.animate( from, to, options, interpolator );
	}

	applyValue ( value ) {
		this.target.applyValue( value );
	}

	attach ( fragment ) {
		const model = resolveReference( fragment, this.key );
		if ( model ) {
			this.relinking( model, true, false );
		} else { // if there is no link available, move everything here to real models
			this.owner.unlink();
		}
	}

	detach () {
		this.relinking( missing, true, false );
	}

	get ( shouldCapture, opts ) {
		if ( shouldCapture ) {
			capture( this );

			// may need to tell the target to unwrap
			opts = opts || {};
			opts.unwrap = true;
		}

		return this.target.get( false, opts );
	}

	getKeypath ( ractive ) {
		if ( ractive && ractive !== this.root.ractive ) return this.target.getKeypath( ractive );

		return super.getKeypath( ractive );
	}

	getKeypathModel ( ractive ) {
		if ( !this.keypathModel ) this.keypathModel = new KeypathModel( this );
		if ( ractive && ractive !== this.root.ractive ) return this.keypathModel.getChild( ractive );
		return this.keypathModel;
	}

	handleChange () {
		this.deps.forEach( handleChange );
		this.links.forEach( handleChange );
		this.notifyUpstream();
	}

	isDetached () { return this.virtual && this.target === missing; }

	joinKey ( key ) {
		// TODO: handle nested links
		if ( key === undefined || key === '' ) return this;

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			const child = new LinkModel( this, this, this.target.joinKey( key ), key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	}

	mark () {
		this.target.mark();
	}

	marked () {
		this.links.forEach( marked );

		this.deps.forEach( handleChange );
		this.clearUnresolveds();
	}

	notifiedUpstream () {
		this.links.forEach( notifiedUpstream );
		this.deps.forEach( handleChange );
	}

	relinked () {
		this.target.registerLink( this );
		this.children.forEach( c => c.relinked() );
	}

	relinking ( target, root, safe ) {
		if ( root && this.sourcePath ) target = rebindMatch( this.sourcePath, target, this.target );
		if ( !target || this.target === target ) return;

		this.target.unregisterLink( this );
		if ( this.keypathModel ) this.keypathModel.rebindChildren( target );

		this.target = target;
		this.children.forEach( c => {
			c.relinking( target.joinKey( c.key ), false, safe );
		});

		if ( root ) this.addShuffleTask( () => {
			this.relinked();
			if ( !safe ) this.notifyUpstream();
		});
	}

	set ( value ) {
		this.target.set( value );
	}

	shuffle ( newIndices ) {
		// watch for extra shuffles caused by a shuffle in a downstream link
		if ( this.shuffling ) return;

		// let the real model handle firing off shuffles
		if ( !this.target.shuffling ) {
			this.target.shuffle( newIndices );
		} else {
			this.shuffling = true;

			let i = newIndices.length;
			while ( i-- ) {
				const idx = newIndices[ i ];
				// nothing is actually changing, so move in the index and roll on
				if ( i === idx ) {
					continue;
				}

				// rebind the children on i to idx
				if ( i in this.childByKey ) this.childByKey[ i ].rebinding( !~idx ? undefined : this.joinKey( idx ), this.childByKey[ i ], true );

				if ( !~idx && this.keyModels[ i ] ) {
					this.keyModels[i].rebinding( undefined, this.keyModels[i], false );
				} else if ( ~idx && this.keyModels[ i ] ) {
					if ( !this.keyModels[ idx ] ) this.childByKey[ idx ].getKeyModel( idx );
					this.keyModels[i].rebinding( this.keyModels[ idx ], this.keyModels[i], false );
				}
			}

			const upstream = this.source().length !== this.source().value.length;

			this.links.forEach( l => l.shuffle( newIndices ) );

			i = this.deps.length;
			while ( i-- ) {
				if ( this.deps[i].shuffle ) this.deps[i].shuffle( newIndices );
			}

			this.marked();

			if ( upstream ) this.notifyUpstream();

			this.shuffling = false;
		}

	}

	source () {
		if ( this.target.source ) return this.target.source();
		else return this.target;
	}

	teardown () {
		if ( this._link ) this._link.teardown();
		this.children.forEach( teardown );
	}
}

ModelBase.prototype.link = function link ( model, keypath, options ) {
	const lnk = this._link || new LinkModel( this.parent, this, model, this.key );
	lnk.implicit = options && options.implicit;
	lnk.sourcePath = keypath;
	if ( this._link ) this._link.relinking( model, true, false );
	this.rebinding( lnk, this, false );
	fireShuffleTasks();

	const unresolved = !this._link;
	this._link = lnk;
	if ( unresolved ) this.parent.clearUnresolveds();
	lnk.marked();
	return lnk;
};

ModelBase.prototype.unlink = function unlink () {
	if ( this._link ) {
		const ln = this._link;
		this._link = undefined;
		ln.rebinding( this, this._link );
		fireShuffleTasks();
		ln.teardown();
	}
};
