export default function ( camelCaseStr ) {
	return camelCaseStr.replace( /([A-Z])/g, ( match, $1 ) => {
		return '-' + $1.toLowerCase();
	});
}
