import { mapKeys, mapValues, filter, extend } from 'utils/object';
import registries from '../registries';
import wrapMethod from 'utils/wrapMethod';

const isRegistry = mapValues(mapKeys(registries, registry => registry.name), () => true);

var staticMembersConfigurator = {

    extend: ( Parent, proto, options ) => {

        var Child = proto.constructor,

        // Note: registry names are [currently] the only other enumerable static members of `Component`s,
        // though those are [currently] not consistent with that of `Ractive`. Should we fix that?
            parentMembers = Parent._Parent
                ? filter( Parent, ( value, key ) => !( key in isRegistry ) )
                : { extend: Parent.extend },

            newMembers = mapValues( options.staticMembers || {}, ( value, name ) => {
                if ( name in isRegistry ){ throw new Error( '"' + name + '" is a reserved static member name' ); }
                if ( (typeof value == 'function') && ( name in parentMembers ) ) {
                    var parentMember = parentMembers[ name ];
                    value = wrapMethod( value, typeof parentMember == 'function' ? parentMember : () => parentMember );
                }
                return value;
            });

        extend(Child, parentMembers, newMembers);

    },

    init () {}
};

export default staticMembersConfigurator;
