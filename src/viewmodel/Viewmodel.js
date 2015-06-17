import { capture } from 'global/capture';
import ComputedNode from './nodes/ComputedNode';
import DataNode from './nodes/DataNode';
import { handleChange, mark } from 'shared/methodCallers';
import { isArray, isObject } from 'utils/is';

export default class Viewmodel extends DataNode {
	constructor ( options ) {
		super( null, null );

		this.isRoot = true;
		this.root = this;
		this.ractive = options.ractive; // TODO sever this link

		this.value = options.data;
		this.adaptors = options.adapt;
		this.adapt();

		this.mappings = {};

		this.computationContext = options.ractive;
		this.computations = {};

		if ( options.computations ) {
			Object.keys( options.computations ).forEach( key => {
				const signature = options.computations[ key ];
				const computation = this.compute( key, signature );
				computation.init();
			});
		}
	}

	applyChanges () {
		this._changeHash = {};
		this.flush();

		return this._changeHash;
	}

	compute ( key, signature ) {
		const computation = new ComputedNode( this, signature, key );
		this.computations[ key ] = computation;

		return computation;
	}

	findMatches ( keys ) {
		const len = keys.length;

		let existingMatches = [ this ];
		let matches;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			const key = keys[i];

			if ( key === '*' ) {
				matches = [];
				existingMatches.forEach( model => {
					if ( isArray( model.value ) ) {
						model.value.forEach( ( member, i ) => {
							matches.push( model.join([ i ]) );
						});
					}

					else if ( isObject( model.value ) || typeof model.value === 'function' ) {
						Object.keys( model.value ).forEach( key => {
							matches.push( model.join([ key ] ) );
						})
					}
				});
			} else {
				matches = existingMatches.map( model => model.join([ key ]) );
			}

			existingMatches = matches;
		}

		return matches;
	}

	get () {
		capture( this );
		return this.value;
	}

	getKeypath () {
		return '';
	}

	join ( keys ) {
		const key = keys[0];

		const mapping = this.mappings[ key ] || this.computations[ key ];

		if ( mapping ) return mapping.join( keys.slice( 1 ) );
		return super.join( keys );
	}

	map ( localKey, origin ) {
		// TODO remapping
		this.mappings[ localKey ] = origin;
	}

	set ( value ) {
		// TODO wrapping root node is a baaaad idea. We should prevent this
		const wrapper = this.wrapper;
		if ( wrapper ) {
			const shouldTeardown = !wrapper.reset || wrapper.reset( value ) === false;

			if ( shouldTeardown ) {
				wrapper.teardown();
				this.wrapper = null;
				this.value = value;
				this.adapt();
			}
		} else {
			this.value = value;
			this.adapt();
		}

		this.deps.forEach( handleChange );
		this.children.forEach( mark );
		this.clearUnresolveds();
	}

	update () {
		// noop
	}
}
