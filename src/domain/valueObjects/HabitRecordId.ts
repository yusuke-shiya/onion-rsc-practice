import { z } from 'zod';
import { ValueObjectValidationError } from '../errors/DomainError';

/**
 * 習慣実行記録ID値オブジェクト
 * UUID形式の文字列で習慣実行記録を一意識別する
 */

const habitRecordIdSchema = z.string().uuid('Invalid habit record ID format');

export class HabitRecordId {
  private readonly value: string;

  constructor(value: string) {
    const result = habitRecordIdSchema.safeParse(value);
    if (!result.success) {
      throw new ValueObjectValidationError(
        'HabitRecordId',
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
   * 別のHabitRecordIdとの等価性を確認
   */
  equals(other: HabitRecordId): boolean {
    return this.value === other.value;
  }

  /**
   * 新しいHabitRecordIdを生成
   */
  static generate(): HabitRecordId {
    return new HabitRecordId(crypto.randomUUID());
  }

  /**
   * 値の取得（読み取り専用）
   */
  getValue(): string {
    return this.value;
  }
}