import namespaces from 'config/namespaces';

var defaultNamespaces = {
	svg: namespaces.svg,
	foreignObject: namespaces.html
};

export default function ( template, parent ) {
	// if the element has an xmlns attribute, use that
	if ( template.a && template.a.xmlns ) {
		return template.a.xmlns;
	}

	// otherwise, guess namespace for svg/foreignObject elements, or inherit namespace from parent
	return ( defaultNamespaces[ template.e ] || ( parent && parent.namespace ) || namespaces.html );
}
