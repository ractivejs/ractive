export default function initBinding ( binding, element, name ) {
	binding.element = element;
	binding.root = element.root;
	binding.attribute = element.attributes[ name || 'value' ];
	binding.keypath = binding.attribute.interpolator.keypath;
}
