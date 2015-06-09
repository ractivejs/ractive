import DataNode from './DataNode';

export default class RootNode {
	constructor ( viewmodel, data ) {
		this.viewmodel = viewmodel;
		this.data = data;

		this.children = [];
		this.childByKey = {};
	}

	get () {
		return this.data;
	}

	join ( key ) {
		if ( !this.childByKey[ key ] ) {
			const child = new DataNode( this, key );
			this.childByKey[ key ] = child;
			this.children.push( child );
		}

		return this.childByKey[ key ];
	}
}
