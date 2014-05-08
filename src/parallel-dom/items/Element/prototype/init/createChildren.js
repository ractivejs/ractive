import circular from 'circular';
import warn from 'utils/warn';

var Fragment, updateCss, updateScript;

circular.push( function () {
	Fragment = circular.Fragment;
});



export default function appendElementChildren ( element, template ) {
	element.fragment = new Fragment({
		template: template.f,
		root:     element.root,
		owner:    element,
		pElement: element,
	});
}
