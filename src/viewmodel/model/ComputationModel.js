import Model from './Model';
import { ExpressionStore } from '../model/store';
import Computation from '../Computation/NewComputation';

class ComputationModel extends Model {

	constructor ( key, signature, owner ) {

		// TODO this should be easy(ier) to unwind now...
		var store = new ExpressionStore( new Computation( owner, signature ) );
		store.computation.setModel( this );
		super ( key, store );

	}



}

export default ComputationModel;
