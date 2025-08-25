/**
 * Server-only utilities
 * このファイルはサーバーサイドでのみ使用されることを保証します
 */

if (typeof window !== 'undefined') {
  throw new Error(
    'This module should only be used on the server side. ' +
    'It appears you are trying to use it in a client component.'
  );
}

export * from '../infrastructure/di/DIContainer';