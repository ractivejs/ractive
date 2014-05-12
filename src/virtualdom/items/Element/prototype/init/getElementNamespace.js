import namespaces from 'config/namespaces';

export default function ( template, parent ) {
	// if the element has an xmlns attribute, use that
	if ( template.a && template.a.xmlns ) {
		return template.a.xmlns;
	}

	// otherwise, use the svg namespace if this is an svg element, or inherit namespace from parent
	return ( template.e === 'svg' ? namespaces.svg : parent && parent.namespace || namespaces.html );
}
