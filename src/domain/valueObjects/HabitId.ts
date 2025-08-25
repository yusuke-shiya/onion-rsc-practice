import { z } from 'zod';
import { ValueObjectValidationError } from '../errors/DomainError';

/**
 * 習慣ID値オブジェクト
 * UUID形式の文字列で習慣を一意識別する
 */

const habitIdSchema = z.string().uuid('Invalid habit ID format');

export class HabitId {
  private readonly value: string;

  constructor(value: string) {
    const result = habitIdSchema.safeParse(value);
    if (!result.success) {
      throw new ValueObjectValidationError(
        'HabitId',
        value,
        result.error.issues[0].message
      );
    }
    this.value = value;
  }

  /**
   * 文字列表現を返す
   */
  toString(): string {
    return this.value;
  }

  /**
   * 別のHabitIdとの等価性を確認
   */
  equals(other: HabitId): boolean {
    return this.value === other.value;
  }

  /**
   * 新しいHabitIdを生成
   */
  static generate(): HabitId {
    return new HabitId(crypto.randomUUID());
  }

  /**
   * 値の取得（読み取り専用）
   */
  getValue(): string {
    return this.value;
  }
}