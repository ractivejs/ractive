import initOptions from 'config/initOptions';
import svg from 'config/svg';
import defineProperties from 'utils/defineProperties';
import proto from 'Ractive/prototype/_prototype';
import partialRegistry from 'registries/partials';
import adaptorRegistry from 'registries/adaptors';
import componentsRegistry from 'registries/components';
import easingRegistry from 'registries/easing';
import interpolatorsRegistry from 'registries/interpolators';
import Promise from 'utils/Promise';
import extend from 'extend/_extend';
import parse from 'parse/_parse';
import initialise from 'Ractive/initialise';
import circular from 'circular';

// Main Ractive required object
var Ractive = function ( options ) {
    initialise( this, options );
};

Ractive.prototype = proto;

// Read-only properties
defineProperties( Ractive, {

    // Shared properties
    partials: { value: partialRegistry },

    // Plugins
    adaptors:      { value: adaptorRegistry },
    easing:        { value: easingRegistry },
    transitions:   { value: {} },
    events:        { value: {} },
    components:    { value: componentsRegistry },
    decorators:    { value: {} },
    interpolators: { value: interpolatorsRegistry },

    // Default options
    defaults:    { value: initOptions.defaults },

    // Support
    svg: { value: svg },

    VERSION:     { value: '<%= pkg.version %>' }
});

// TODO deprecated
Ractive.eventDefinitions = Ractive.events;

Ractive.prototype.constructor = Ractive;

// Namespaced constructors
Ractive.Promise = Promise;

// Static methods
Ractive.extend = extend;

Ractive.parse = parse;
circular.Ractive = Ractive;
export default Ractive;
