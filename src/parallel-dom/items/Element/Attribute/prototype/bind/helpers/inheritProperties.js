export default function inheritProperties ( binding, attribute, node ) {
	binding.attr = attribute;
	binding.node = node;
	binding.root = attribute.root;
	binding.keypath = attribute.keypath;
}
