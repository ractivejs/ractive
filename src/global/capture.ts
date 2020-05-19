import { addToArray } from 'utils/array';
import ModelBase from 'src/model/ModelBase';

const stack = [];
let captureGroup: ModelBase[];

export function startCapturing(): void {
  stack.push((captureGroup = []));
}

export function capture(model: ModelBase): void {
  if (captureGroup) {
    addToArray(captureGroup, model);
  }
}

export function stopCapturing(): ModelBase[] {
  const dependencies = stack.pop();
  captureGroup = stack[stack.length - 1];
  return dependencies;
}
