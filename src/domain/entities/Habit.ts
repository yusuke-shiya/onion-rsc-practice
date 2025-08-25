import { HabitId, HabitName, TargetFrequency } from '../valueObjects';
import { BusinessRuleViolationError } from '../errors/DomainError';

/**
 * 習慣エンティティ
 * 習慣の基本情報を管理するドメインエンティティ
 */
export class Habit {
  private constructor(
    private readonly _id: HabitId,
    private _name: HabitName,
    private _description: string | undefined,
    private readonly _targetFrequency: TargetFrequency,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _isActive: boolean = true
  ) {}

  /**
   * 新しい習慣を作成するファクトリーメソッド
   */
  static create(
    name: HabitName,
    description: string | undefined,
    targetFrequency: TargetFrequency
  ): Habit {
    const now = new Date();
    return new Habit(
      HabitId.generate(),
      name,
      description,
      targetFrequency,
      now,
      now,
      true
    );
  }

  /**
   * 既存の習慣を復元するファクトリーメソッド（リポジトリから読み込み時に使用）
   */
  static reconstruct(
    id: HabitId,
    name: HabitName,
    description: string | undefined,
    targetFrequency: TargetFrequency,
    createdAt: Date,
    updatedAt: Date,
    isActive: boolean = true
  ): Habit {
    return new Habit(
      id,
      name,
      description,
      targetFrequency,
      createdAt,
      updatedAt,
      isActive
    );
  }

  /**
   * ID取得
   */
  get id(): HabitId {
    return this._id;
  }

  /**
   * 習慣名取得
   */
  get name(): HabitName {
    return this._name;
  }

  /**
   * 説明取得
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * ターゲット頻度取得
   */
  get targetFrequency(): TargetFrequency {
    return this._targetFrequency;
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
   * アクティブ状態取得
   */
  get isActive(): boolean {
    return this._isActive;
  }

  /**
   * 習慣名を更新
   */
  updateName(newName: HabitName): void {
    if (!this._isActive) {
      throw new BusinessRuleViolationError(
        'UpdateInactiveHabit',
        'Cannot update name of inactive habit'
      );
    }

    this._name = newName;
    this._updatedAt = new Date();
  }

  /**
   * 説明を更新
   */
  updateDescription(newDescription: string | undefined): void {
    if (!this._isActive) {
      throw new BusinessRuleViolationError(
        'UpdateInactiveHabit',
        'Cannot update description of inactive habit'
      );
    }

    this._description = newDescription;
    this._updatedAt = new Date();
  }

  /**
   * 習慣を非アクティブにする（論理削除）
   */
  deactivate(): void {
    if (!this._isActive) {
      throw new BusinessRuleViolationError(
        'DeactivateInactiveHabit',
        'Cannot deactivate already inactive habit'
      );
    }

    this._isActive = false;
    this._updatedAt = new Date();
  }

  /**
   * 習慣を再アクティブ化する
   */
  reactivate(): void {
    if (this._isActive) {
      throw new BusinessRuleViolationError(
        'ReactivateActiveHabit',
        'Cannot reactivate already active habit'
      );
    }

    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * エンティティ同士の等価性を確認（ID基準）
   */
  equals(other: Habit): boolean {
    return this._id.equals(other._id);
  }
}