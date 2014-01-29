define( function () {

	'use strict';

	return function ( relativePath, base, force ) {
		var pathParts, relativePathParts, part;

		// `force` is `true` if this comes from a top-level call
		// (i.e. from `Ractive.load()`) - in this case, all paths
		// should be treated as relative to Ractive.baseUrl
		if ( !force ) {
			if ( relativePath.charAt( 0 ) !== '.' ) {
				// not a relative path!
				return relativePath;
			}
		} else {
			if ( base && base.charAt( base.length - 1 ) !== '/' ) {
				// e.g. `Ractive.baseUrl === 'imports'` - should be
				// treated as `imports/`
				base += '/';
			}
		}

		// 'foo/bar/baz.html' -> ['foo', 'bar', 'baz.html']
		pathParts = ( base || '' ).split( '/' );
		relativePathParts = relativePath.split( '/' );

		// ['foo', 'bar', 'baz.html'] -> ['foo', 'bar']
		pathParts.pop();

		while ( part = relativePathParts.shift() ) {
			if ( part === '..' ) {
				pathParts.pop();
			} else if ( part !== '.' ) {
				pathParts.push( part );
			}
		}

		return pathParts.join( '/' );
	};

});
