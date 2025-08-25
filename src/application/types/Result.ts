/**
 * Result型 - 成功・失敗を表現する型安全なパターン
 * RustのResult型からインスパイア
 */

export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

export interface Failure<E = Error> {
  readonly success: false;
  readonly error: E;
}

/**
 * Successインスタンスを作成
 */
export function success<T>(data: T): Success<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Failureインスタンスを作成
 */
export function failure<E = Error>(error: E): Failure<E> {
  return {
    success: false,
    error,
  };
}

/**
 * Result型のユーティリティ関数
 */
export class ResultUtils {
  /**
   * Resultが成功かどうかを判定
   */
  static isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
    return result.success;
  }

  /**
   * Resultが失敗かどうかを判定
   */
  static isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
    return !result.success;
  }

  /**
   * 成功時のデータを取得、失敗時はデフォルト値を返す
   */
  static getOrDefault<T, E>(result: Result<T, E>, defaultValue: T): T {
    return result.success ? result.data : defaultValue;
  }

  /**
   * 成功時のデータを取得、失敗時は例外を投げる
   */
  static unwrap<T, E>(result: Result<T, E>): T {
    if (result.success) {
      return result.data;
    }
    throw result.error;
  }

  /**
   * Resultの値を変換
   */
  static map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
    return result.success ? success(fn(result.data)) : result;
  }

  /**
   * Resultをチェーン
   */
  static flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
    return result.success ? fn(result.data) : result;
  }

  /**
   * エラーを変換
   */
  static mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
    return result.success ? result : failure(fn(result.error));
  }
}