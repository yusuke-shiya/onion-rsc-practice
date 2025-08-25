import { z } from 'zod';
import { ValueObjectValidationError } from '../errors/DomainError';

/**
 * ターゲット頻度値オブジェクト
 * 習慣の実行頻度を管理する（daily, weekly, monthly）
 */

export const TargetFrequencyType = {
  DAILY: 'daily',
  WEEKLY: 'weekly', 
  MONTHLY: 'monthly',
} as const;

export type TargetFrequencyValue = typeof TargetFrequencyType[keyof typeof TargetFrequencyType];

const targetFrequencySchema = z.enum(['daily', 'weekly', 'monthly'], {
  message: 'Target frequency must be daily, weekly, or monthly'
});

export class TargetFrequency {
  private readonly value: TargetFrequencyValue;

  constructor(value: string) {
    const result = targetFrequencySchema.safeParse(value);
    if (!result.success) {
      throw new ValueObjectValidationError(
        'TargetFrequency',
        value,
        result.error.issues[0].message
      );
    }
    this.value = result.data;
  }

  /**
   * 値の取得（読み取り専用）
   */
  getValue(): TargetFrequencyValue {
    return this.value;
  }

  /**
   * 別のTargetFrequencyとの等価性を確認
   */
  equals(other: TargetFrequency): boolean {
    return this.value === other.value;
  }

  /**
   * 文字列表現を返す
   */
  toString(): string {
    return this.value;
  }

  /**
   * 日本語表記を返す
   */
  toJapanese(): string {
    switch (this.value) {
      case TargetFrequencyType.DAILY:
        return '毎日';
      case TargetFrequencyType.WEEKLY:
        return '毎週';
      case TargetFrequencyType.MONTHLY:
        return '毎月';
      default:
        return this.value;
    }
  }

  /**
   * 日次頻度かどうかを判定
   */
  isDaily(): boolean {
    return this.value === TargetFrequencyType.DAILY;
  }

  /**
   * 週次頻度かどうかを判定
   */
  isWeekly(): boolean {
    return this.value === TargetFrequencyType.WEEKLY;
  }

  /**
   * 月次頻度かどうかを判定
   */
  isMonthly(): boolean {
    return this.value === TargetFrequencyType.MONTHLY;
  }

  /**
   * ファクトリーメソッド - 日次頻度
   */
  static daily(): TargetFrequency {
    return new TargetFrequency(TargetFrequencyType.DAILY);
  }

  /**
   * ファクトリーメソッド - 週次頻度
   */
  static weekly(): TargetFrequency {
    return new TargetFrequency(TargetFrequencyType.WEEKLY);
  }

  /**
   * ファクトリーメソッド - 月次頻度
   */
  static monthly(): TargetFrequency {
    return new TargetFrequency(TargetFrequencyType.MONTHLY);
  }
}