import BindingContext from './BindingContext';
import ComputationStore from '../stores/ComputationStore';
import Computation from '../Computation/Computation';

class ComputedContext extends BindingContext {

	constructor ( key, signature, owner, initialValue ) {

		// TODO: this should be easy(ier) to unwind now...
		var computation = new Computation( owner, signature, initialValue );
		var store = new ComputationStore( computation );
		store.computation.setModel( this );
		super ( key, store );
	}

	mark () {
		this.store.invalidate();
		super.mark();
	}
}

export default ComputedContext;
