import ModelBase, { fireShuffleTasks, maybeBind, shuffle } from './ModelBase';
import KeypathModel from './specials/KeypathModel';
import { capture } from '../global/capture';
import { handleChange, marked, markedAll, teardown } from '../shared/methodCallers';
import { rebindMatch } from '../shared/rebind';
import resolveReference from '../view/resolvers/resolveReference';
import noop from '../utils/noop';

// temporary placeholder target for detached implicit links
export const Missing = {
	key: '@missing',
	animate: noop,
	applyValue: noop,
	get: noop,
	getKeypath () { return this.key; },
	joinAll () { return this; },
	joinKey () { return this; },
	mark: noop,
	registerLink: noop,
	shufle: noop,
	set: noop,
	unregisterLink: noop
};
Missing.parent = Missing;

export default class LinkModel extends ModelBase {
	constructor ( parent, owner, target, key ) {
		super( parent );

		this.owner = owner;
		this.target = target;
		this.key = key === undefined ? owner.key : key;
		if ( owner.isLink ) this.sourcePath = `${owner.sourcePath}.${this.key}`;

		target.registerLink( this );

		if ( parent ) this.isReadonly = parent.isReadonly;

		this.isLink = true;
	}

	animate ( from, to, options, interpolator ) {
		return this.target.animate( from, to, options, interpolator );
	}

	applyValue ( value ) {
		if ( this.boundValue ) this.boundValue = null;
		this.target.applyValue( value );
	}

	attach ( fragment ) {
		const model = resolveReference( fragment, this.key );
		if ( model ) {
			this.relinking( model, false );
		} else { // if there is no link available, move everything here to real models
			this.owner.unlink();
		}
	}

	detach () {
		this.relinking( Missing, false );
	}

	get ( shouldCapture, opts = {} ) {
		if ( shouldCapture ) {
			capture( this );

			// may need to tell the target to unwrap
			opts.unwrap = true;
		}

		const bind = 'shouldBind' in opts ? opts.shouldBind : true;
		opts.shouldBind = this.mapping && this.target.parent && this.target.parent.isRoot;

		return maybeBind( this, this.target.get( false, opts ), bind );
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

	isDetached () { return this.virtual && this.target === Missing; }

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

	mark ( force ) {
		this.target.mark( force );
	}

	marked () {
		if ( this.boundValue ) this.boundValue = null;

		this.links.forEach( marked );

		this.deps.forEach( handleChange );
	}

	markedAll () {
		this.children.forEach( markedAll );
		this.marked();
	}

	notifiedUpstream ( startPath, root ) {
		this.links.forEach( l => l.notifiedUpstream( startPath, this.root ) );
		this.deps.forEach( handleChange );
		if ( startPath && this.rootLink && this.root !== root ) {
			const path = startPath.slice( 1 );
			path.unshift( this.key );
			this.notifyUpstream( path );
		}
	}

	relinked () {
		this.target.registerLink( this );
		this.children.forEach( c => c.relinked() );
	}

	relinking ( target, safe ) {
		if ( this.rootLink && this.sourcePath ) target = rebindMatch( this.sourcePath, target, this.target );
		if ( !target || this.target === target ) return;

		this.target.unregisterLink( this );
		if ( this.keypathModel ) this.keypathModel.rebindChildren( target );

		this.target = target;
		this.children.forEach( c => {
			c.relinking( target.joinKey( c.key ), safe );
		});

		if ( this.rootLink ) this.addShuffleTask( () => {
			this.relinked();
			if ( !safe ) {
				this.markedAll();
				this.notifyUpstream();
			}
		});
	}

	set ( value ) {
		if ( this.boundValue ) this.boundValue = null;
		this.target.set( value );
	}

	shuffle ( newIndices ) {
		// watch for extra shuffles caused by a shuffle in a downstream link
		if ( this.shuffling ) return;

		// let the real model handle firing off shuffles
		if ( !this.target.shuffling ) {
			this.target.shuffle( newIndices );
		} else {
			shuffle( this, newIndices, true );
		}

	}

	source () {
		if ( this.target.source ) return this.target.source();
		else return this.target;
	}

	teardown () {
		if ( this._link ) this._link.teardown();
		this.target.unregisterLink( this );
		this.children.forEach( teardown );
	}
}

ModelBase.prototype.link = function link ( model, keypath, options ) {
	const lnk = this._link || new LinkModel( this.parent, this, model, this.key );
	lnk.implicit = options && options.implicit;
	lnk.mapping = options && options.mapping;
	lnk.sourcePath = keypath;
	lnk.rootLink = true;
	if ( this._link ) this._link.relinking( model, false );
	this.rebind( lnk, this, false );
	fireShuffleTasks();

	this._link = lnk;
	lnk.markedAll();

	this.notifyUpstream();
	return lnk;
};

ModelBase.prototype.unlink = function unlink () {
	if ( this._link ) {
		const ln = this._link;
		this._link = undefined;
		ln.rebind( this, ln, false );
		fireShuffleTasks();
		ln.teardown();
		this.notifyUpstream();
	}
};
