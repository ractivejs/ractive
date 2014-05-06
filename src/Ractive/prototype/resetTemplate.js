import Promise from 'utils/Promise';
import initialiseRegistries from 'Ractive/initialise/initialiseRegistries';
import renderInstance from 'Ractive/initialise/renderInstance';

export default function ( template, callback ) {
    var promise, changes, options = {
        updatesOnly: true,
        registries: ['template', 'partials']
    };

    if ( typeof template === 'function' && !callback ) {
        callback = template;
        template = void 0;
    }

    if(template){
        options.newValues = {
            template: template
        };
    }
    
    changes = initialiseRegistries ( this, 
        this.constructor.defaults, 
        this.initOptions, 
        options);

    if ( changes.length ) {

        this.teardown();

        this._initing = true;
        
        promise = renderInstance ( this, this.initOptions );
        
        //same as initialise, but should this be in then()?
        this._initing = false;

    } else {
        promise = Promise.resolve();
    }

    if ( callback ) {
        promise.then( callback );
    }

    return promise;
};
