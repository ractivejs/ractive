import type ModelBase from 'model/ModelBase';
import type KeyModel from 'model/specials/KeyModel';
import { addToArray } from 'utils/array';

// TODO refine types on this two variables and in stopCapturing function
const stack = [];
let captureGroup: [];

export function startCapturing(): void {
  stack.push((captureGroup = []));
}

export function capture(model: KeyModel): void;
export function capture(model: ModelBase): void;
export function capture(model: ModelBase | KeyModel): void {
  if (captureGroup) {
    addToArray(captureGroup, model);
  }
}

export function stopCapturing(): (KeyModel | ModelBase)[] {
  const dependencies = stack.pop();
  captureGroup = stack[stack.length - 1];
  return dependencies;
}
