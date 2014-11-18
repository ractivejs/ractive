export default function Viewmodel$origin ( key ) {
	var map = this.mappings[ key ];
	return map ? map.origin : this;
}
