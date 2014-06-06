import createComponentBinding from 'shared/createComponentBinding';
import set from 'shared/set';

export default function createInitialComponentBindings ( component, toBind ) {
	toBind.forEach( function createInitialComponentBinding ( pair ) {
		var childValue, parentValue;

		createComponentBinding( component, component.root, pair.parentKeypath, pair.childKeypath );

		childValue = component.instance.viewmodel.get( pair.childKeypath );
		parentValue = component.root.viewmodel.get( pair.parentKeypath );

		if ( childValue !== undefined && parentValue === undefined ) {
			set( component.root, pair.parentKeypath, childValue );
		}
	});
}
