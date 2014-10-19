export default function Component$createMapping ( origin, originKeypath, localKeypath ) {
	var mapping = {
		origin: origin,
		keypath: originKeypath
	};

	this.mappings[ localKeypath ] = mapping;
	return mapping;
}