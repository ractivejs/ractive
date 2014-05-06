import runloop from 'global/runloop';

export default function () {
    if ( !this._dirty ) {
        runloop.addLiveQuery( this );
        this._dirty = true;
    }
};
