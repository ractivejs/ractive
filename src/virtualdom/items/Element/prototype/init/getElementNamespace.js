import namespaces from 'config/namespaces';

export default function ( template, parent ) {
	var namespace;

	// if the element has an xmlns attribute, use that
	if ( template.a && template.a.xmlns ) {
		return template.a.xmlns;
	}

	// otherwise, guess namespace for <svg/> elements, or inherit namespace from parent, unless
	// parent is a <foreignObject/>
	if ( template.e === 'svg' ) {
		namespace = namespaces.svg;
	} else if ( parent ) {
		namespace = ( parent.name === 'foreignObject' ? namespaces.html : parent.namespace );
	}

	return namespace || namespaces.html;
}
