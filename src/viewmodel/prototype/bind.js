export default function Viewmodel$bind ( origin, originKeypath, localKeypath ) {
	this.bindings[ localKeypath ] = {
		origin: origin,
		keypath: originKeypath
	};
}