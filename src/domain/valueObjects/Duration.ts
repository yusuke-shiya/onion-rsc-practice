import { z } from 'zod';
import { ValueObjectValidationError } from '../errors/DomainError';

/**
 * 持続時間値オブジェクト
 * 0-1440分（24時間）の範囲で実行時間を管理する
 */

const durationSchema = z.number()
  .int('Duration must be an integer')
  .min(0, 'Duration cannot be negative')
  .max(1440, 'Duration cannot exceed 24 hours (1440 minutes)');

export class Duration {
  private readonly minutes: number;

  constructor(minutes: number) {
    const result = durationSchema.safeParse(minutes);
    if (!result.success) {
      throw new ValueObjectValidationError(
        'Duration',
        minutes,
        result.error.issues[0].message
      );
    }
    this.minutes = minutes;
  }

  /**
   * 分単位で時間を返す
   */
  toMinutes(): number {
    return this.minutes;
  }

  /**
   * 時間:分 形式の文字列を返す
   */
  toString(): string {
    if (this.minutes < 60) {
      return `${this.minutes}分`;
    }
    
    const hours = Math.floor(this.minutes / 60);
    const remainingMinutes = this.minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}時間`;
    }
    
    return `${hours}時間${remainingMinutes}分`;
  }

  /**
   * 別のDurationとの等価性を確認
   */
  equals(other: Duration): boolean {
    return this.minutes === other.minutes;
  }

  /**
   * 分から作成するファクトリーメソッド
   */
  static fromMinutes(minutes: number): Duration {
    return new Duration(minutes);
  }

  /**
   * 時間から作成するファクトリーメソッド
   */
  static fromHours(hours: number): Duration {
    return new Duration(hours * 60);
  }
}