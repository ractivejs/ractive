import BindingContext from './BindingContext';
import ComputedStore from '../stores/ComputedStore';

// TODO: this class not pulling its weight.
// Can we just use ComputedStore with a
// BindingContext?
class ComputedContext extends BindingContext {

	constructor ( key, signature ) {
		var store = new ComputedStore( signature, this );
		super ( key, store );
	}

	mark () {
		this.store.invalidate();
		super.mark();
	}
}

export default ComputedContext;
