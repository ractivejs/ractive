(function () {

	var elementCache = {};

	insertHtml = function ( html, tagName, docFrag ) {
		var container, nodes = [];

		container = elementCache[ tagName ] || ( elementCache[ tagName ] = doc.createElement( tagName ) );
		container.innerHTML = html;

		while ( container.firstChild ) {
			nodes[ nodes.length ] = container.firstChild;
			docFrag.appendChild( container.firstChild );
		}

		return nodes;
	};

}());