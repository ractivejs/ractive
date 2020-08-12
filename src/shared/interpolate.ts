import { missingPlugin } from 'config/errors';
import { RactiveFake } from 'types/RactiveFake';
import { fatal } from 'utils/log';

import interpolators, { InterpolatorFunction } from '../Ractive/static/interpolators';

import { findInViewHierarchy } from './registry';

export function interpolate<T>(from: T, to: T): ReturnType<InterpolatorFunction<T>> | null;
export function interpolate<T>(
  from: T,
  to: T,
  ractive: RactiveFake,
  type: string
): ReturnType<InterpolatorFunction<T>> | null;
export function interpolate<T>(
  from: T,
  to: T,
  ractive?: RactiveFake,
  type?: string
): ReturnType<InterpolatorFunction<T>> | null {
  if (from === to) return null;

  if (type) {
    const interpol = findInViewHierarchy('interpolators', ractive, type);
    if (interpol) return interpol(from, to) || null;

    fatal(missingPlugin(type, 'interpolator'));
  }

  return (
    interpolators.number(from, to) ||
    interpolators.array(from, to) ||
    interpolators.object(from, to) ||
    null
  );
}
