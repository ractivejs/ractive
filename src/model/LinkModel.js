import ModelBase from './ModelBase';
import KeypathModel from './specials/KeypathModel';
import { capture } from '../global/capture';
import { handleChange, mark, marked, teardown } from '../shared/methodCallers';
import runloop from '../global/runloop';

export default class LinkModel extends ModelBase {
	constructor ( parent, owner, target, key ) {
		super( parent );

		this.owner = owner;
		this.target = target;
		this.key = key === undefined ? owner.key : key;

		target.registerLink( this );

		this.isReadonly = parent.isReadonly;

		this.isLink = true;
	}

	animate ( from, to, options, interpolator ) {
		this.target.animate( from, to, options, interpolator );
	}

	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );
		return this.target.get( false );
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
		this.children.forEach( mark );

		this.deps.forEach( handleChange );
		this.clearUnresolveds();
	}

	relinked () {
		this.target.registerLink( this );
		this.handleChange();
		this.children.forEach( c => c.relinked() );
	}

	relinking ( target, root = true ) {
		if ( !target || this.target === target ) return;

		this.target.unregisterLink( this );
		if ( this.keypathModel ) this.keypathModel.rebindChildren( target );

		this.target = target;
		this.children.forEach( c => {
			c.relinking( target.joinKey( c.key ), false );
		});

		if ( root ) runloop.scheduleTask( () => this.relinked() );
	}

	set ( value ) {
		this.target.set( value );
	}

	shuffle ( newIndices ) {
		if ( this.shuffling ) return;
		this.shuffling = true;
		if ( !this.target.shuffling ) this.target.shuffle( newIndices );

		let i = newIndices.length;
		while ( i-- ) {
			const idx = newIndices[ i ];
			// nothing is actually changing, so move in the index and roll on
			if ( i === idx ) {
				continue;
			}

			// rebind the children on i to idx
			if ( i in this.childByKey ) this.childByKey[ i ].rebinding( !~idx ? undefined : this.joinKey( idx ), this.childByKey[ i ] );

			if ( !~idx && this.keyModels[ i ] ) {
				this.keyModels[i].rebinding( undefined, this.keyModels[i]);
			} else if ( ~idx && this.keyModels[ i ] ) {
				if ( !this.keyModels[ idx ] ) this.childByKey[ idx ].getKeyModel( idx );
				this.keyModels[i].rebinding( this.keyModels[ idx ], this.keyModels[i] );
			}
		}

		const upstream = this.source().length !== this.source().value.length;

		this.links.forEach( l => l.shuffle( newIndices ) );

		i = this.deps.length;
		while ( i-- ) {
			if ( this.deps[i].shuffle ) this.deps[i].shuffle( newIndices );
		}

		this.marked();

		i = this.deps.length;
		while ( i-- ) {
			if ( !this.deps[i].shuffle ) this.deps[i].handleChange();
		}

		if ( upstream ) this.notifyUpstream();

		this.shuffling = false;
	}

	source () {
		if ( this.target.source ) return this.target.source();
		else return this.target;
	}

	teardown () {
		this.children.forEach( teardown );
	}
}

ModelBase.prototype.link = function link ( model ) {
	const lnk = this._link || new LinkModel( this.parent, this, model, this.key );
	if ( this._link ) this._link.relinking( model );
	this.rebinding( lnk, this );
	if ( !this._link ) this.parent.clearUnresolveds();
	this._link = lnk;
	return lnk;
};

ModelBase.prototype.unlink = function unlink () {
	if ( this._link ) {
		const ln = this._link;
		this._link = undefined;
		ln.rebinding( this, this._link );
		ln.teardown();
	}
};
