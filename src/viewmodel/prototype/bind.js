export default function Viewmodel$bind ( origin, originKeypath, localKeypath, mapping ) {
	this.bindings[ localKeypath ] = {
		origin: origin,
		mapping: mapping,
		keypath: originKeypath // TODO prob don't need this?
	};
}