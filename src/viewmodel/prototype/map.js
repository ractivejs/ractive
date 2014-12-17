import Mapping from 'shared/parameters/Mapping';

export default function Viewmodel$map ( key, options ) {
	var mapping = this.mappings[ key.str ] = new Mapping( key, options );
	mapping.initViewmodel( this );
	return mapping;
}
