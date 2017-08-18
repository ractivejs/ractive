import { build, set } from '../../shared/set';
import SharedModel  from '../../model/specials/SharedModel';

export default function sharedSet ( keypath, value, options ) {
	const opts = typeof keypath === 'object' ? value : options;
	const model = SharedModel;

	return set( build( { viewmodel: model }, keypath, value, true ), opts );
}
