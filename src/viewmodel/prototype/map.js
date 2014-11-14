import Mapping from 'shared/Parameters/Mapping';

export default function Viewmodel$map ( key, options ) {
	var mapping = new Mapping( key, options );
	mapping.setViewmodel( this );
	this.mappings[ mapping.localKey ] = mapping;
	return mapping;
}
