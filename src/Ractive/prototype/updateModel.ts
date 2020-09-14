import { splitKeypath } from 'shared/keypaths';
import runloop from 'src/global/runloop';
import { Keypath } from 'types/Generic';

function Ractive$updateModel(cascade: boolean): Promise<void>;
function Ractive$updateModel(keypath: Keypath, cascade: boolean): Promise<void>;
function Ractive$updateModel(keypath: Keypath | boolean, cascade?: boolean): Promise<void> {
  const promise = runloop.start();

  if (!keypath) {
    this.viewmodel.updateFromBindings(true);
  } else {
    this.viewmodel.joinAll(splitKeypath(<string>keypath)).updateFromBindings(cascade !== false);
  }

  runloop.end();

  return promise;
}

export default Ractive$updateModel;
