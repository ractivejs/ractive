import ModelBase from 'src/model/ModelBase';
import KeyModel from 'src/model/specials/KeyModel';
import { addToArray } from 'utils/array';

const stack = [];
let captureGroup: CapturableModel[];

type CapturableModel = ModelBase | KeyModel;

export function startCapturing(): void {
  stack.push((captureGroup = []));
}

export function capture(model: CapturableModel): void {
  if (captureGroup) {
    addToArray(captureGroup, model);
  }
}

export function stopCapturing(): CapturableModel[] {
  const dependencies = stack.pop();
  captureGroup = stack[stack.length - 1];
  return dependencies;
}
