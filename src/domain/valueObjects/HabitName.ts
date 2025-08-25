import { z } from 'zod';
import { ValueObjectValidationError } from '../errors/DomainError';

/**
 * 習慣名値オブジェクト
 * 1-100文字の範囲で習慣名を管理する
 */

const habitNameSchema = z.string()
  .min(1, 'Habit name is required')
  .max(100, 'Habit name must be 100 characters or less')
  .trim()
  .refine(
    (value) => value.length > 0,
    'Habit name cannot be empty after trimming'
  );

export class HabitName {
  private readonly _value: string;

  constructor(value: string) {
    const result = habitNameSchema.safeParse(value);
    if (!result.success) {
      throw new ValueObjectValidationError(
        'HabitName',
        value,
        result.error.issues[0].message
      );
    }
    this._value = result.data;
  }

  /**
   * 値の取得（読み取り専用）
   */
  get value(): string {
    return this._value;
  }

  /**
   * 別のHabitNameとの等価性を確認
   */
  equals(other: HabitName): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列表現を返す
   */
  toString(): string {
    return this._value;
  }
}