import { getEnv } from '../helpers';

export const AbortController =
  getEnv() === 'BROWSER' ? window.AbortController : global.AbortController;

export const AbortSignal = getEnv() === 'BROWSER' ? window.AbortSignal : global.AbortSignal;
