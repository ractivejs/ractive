import { Macro } from './Macro';
import { ParseFn } from './Parse';

export type Partial = string | any[] | ParseFn | Macro;

export type PartialMap = Record<string, Partial>;
