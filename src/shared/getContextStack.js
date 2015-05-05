export default function getContextStack ( fragment ){

	return function iterator () {
		var nextFragment, root, iterator;

		function assignFragment ( fragment ) {
			nextFragment = fragment;
			root = fragment.root;
		}


		function getNextContext() {
			var context;

			while ( !context && nextFragment ) {
				context = nextFragment.context;
				nextFragment = nextFragment.parent;
			}

			return context;
		}

		function getRoot(){
			var context;
			if ( !root ) { return; }

			context = root.viewmodel.root;

			if ( root.parent && !root.isolated ) {
				iterator.hasContextChain = true;
				assignFragment( root.component.parentFragment );
			}
			else {
				root = null;
			}

			return context;
		}

		assignFragment( fragment );

		iterator = {
			next () {
				var value = getNextContext() || getRoot();
				return {
					value: value,
					done: !value
				};
			}
		};

		return iterator;
	};
}
