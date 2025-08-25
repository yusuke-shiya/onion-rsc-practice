import { HabitId, HabitRecordId, Duration } from '../valueObjects';
import { BusinessRuleViolationError } from '../errors/DomainError';

/**
 * 習慣実行記録エンティティ
 * 習慣の実行記録を管理するドメインエンティティ
 */
export class HabitRecord {
  private constructor(
    private readonly _id: HabitRecordId,
    private readonly _habitId: HabitId,
    private _executedAt: Date,
    private _duration: Duration | undefined,
    private _note: string | undefined,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  /**
   * 新しい習慣実行記録を作成するファクトリーメソッド
   */
  static create(
    habitId: HabitId,
    executedAt: Date,
    duration?: Duration,
    note?: string
  ): HabitRecord {
    // 未来の日付での実行記録は作成できない
    const now = new Date();
    if (executedAt > now) {
      throw new BusinessRuleViolationError(
        'FutureExecutionDate',
        'Cannot create habit record with future execution date'
      );
    }

    // 実行日が過去すぎる場合（1年より前）は記録できない
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    if (executedAt < oneYearAgo) {
      throw new BusinessRuleViolationError(
        'TooOldExecutionDate',
        'Cannot create habit record older than 1 year'
      );
    }

    // ノートの長さ制限
    if (note && note.length > 500) {
      throw new BusinessRuleViolationError(
        'NoteTooLong',
        'Note cannot exceed 500 characters'
      );
    }

    return new HabitRecord(
      HabitRecordId.generate(),
      habitId,
      executedAt,
      duration,
      note,
      now,
      now
    );
  }

  /**
   * 既存の習慣実行記録を復元するファクトリーメソッド（リポジトリから読み込み時に使用）
   */
  static reconstruct(
    id: HabitRecordId,
    habitId: HabitId,
    executedAt: Date,
    duration: Duration | undefined,
    note: string | undefined,
    createdAt: Date,
    updatedAt: Date
  ): HabitRecord {
    return new HabitRecord(
      id,
      habitId,
      executedAt,
      duration,
      note,
      createdAt,
      updatedAt
    );
  }

  /**
   * ID取得
   */
  get id(): HabitRecordId {
    return this._id;
  }

  /**
   * 習慣ID取得
   */
  get habitId(): HabitId {
    return this._habitId;
  }

  /**
   * 実行日時取得
   */
  get executedAt(): Date {
    return this._executedAt;
  }

  /**
   * 実行時間取得
   */
  get duration(): Duration | undefined {
    return this._duration;
  }

  /**
   * ノート取得
   */
  get note(): string | undefined {
    return this._note;
  }

  /**
   * 作成日時取得
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * 更新日時取得
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * 実行日時を更新
   */
  updateExecutedAt(newExecutedAt: Date): void {
    const now = new Date();
    
    // 未来の日付での実行記録は更新できない
    if (newExecutedAt > now) {
      throw new BusinessRuleViolationError(
        'FutureExecutionDate',
        'Cannot update habit record with future execution date'
      );
    }

    // 実行日が過去すぎる場合（1年より前）は記録できない
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    if (newExecutedAt < oneYearAgo) {
      throw new BusinessRuleViolationError(
        'TooOldExecutionDate',
        'Cannot update habit record to date older than 1 year'
      );
    }

    this._executedAt = newExecutedAt;
    this._updatedAt = now;
  }

  /**
   * 実行時間を更新
   */
  updateDuration(newDuration: Duration | undefined): void {
    this._duration = newDuration;
    this._updatedAt = new Date();
  }

  /**
   * ノートを更新
   */
  updateNote(newNote: string | undefined): void {
    // ノートの長さ制限
    if (newNote && newNote.length > 500) {
      throw new BusinessRuleViolationError(
        'NoteTooLong',
        'Note cannot exceed 500 characters'
      );
    }

    this._note = newNote;
    this._updatedAt = new Date();
  }

  /**
   * 指定日と同じ日に実行されたかを判定
   */
  isExecutedOnDate(date: Date): boolean {
    const executedDate = new Date(
      this._executedAt.getFullYear(),
      this._executedAt.getMonth(),
      this._executedAt.getDate()
    );
    
    const compareDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    
    return executedDate.getTime() === compareDate.getTime();
  }

  /**
   * 今日実行されたかを判定
   */
  isExecutedToday(): boolean {
    return this.isExecutedOnDate(new Date());
  }

  /**
   * エンティティ同士の等価性を確認（ID基準）
   */
  equals(other: HabitRecord): boolean {
    return this._id.equals(other._id);
  }
}