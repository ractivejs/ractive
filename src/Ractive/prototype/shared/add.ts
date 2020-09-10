import { build, set } from 'shared/set';
import { Ractive } from 'src/Ractive/Ractive';
import { Keypath } from 'types/Generic';
import { SetOpts } from 'types/MethodOptions';
import { isNumeric, isString } from 'utils/is';

const errorMessage = 'Cannot add to a non-numeric value';

export default function add(
  ractive: Ractive,
  keypath: Keypath,
  d: number,
  options: SetOpts & { isolated?: boolean }
): Promise<void> {
  if (!isString(keypath) || !isNumeric(d)) {
    throw new Error('Bad arguments');
  }

  const sets = build(ractive, keypath, d, options?.isolated);

  return set(
    sets.map(pair => {
      const [model, add] = pair;
      const value = model.get();
      if (!isNumeric(add) || !isNumeric(value)) throw new Error(errorMessage);
      return [model, value + add];
    })
  );
}
