import { HabitRecord } from '../entities/HabitRecord';
import { HabitId } from '../valueObjects/HabitId';
import { HabitRecordId } from '../valueObjects/HabitRecordId';

/**
 * 習慣実行記録リポジトリインターフェース
 * Onion Architectureの原則に従い、ドメイン層でインターフェースを定義
 * 実装はInfrastructure層で行う（依存性逆転の原則）
 */
export interface HabitRecordRepository {
  /**
   * 習慣実行記録を保存（作成・更新）
   */
  save(record: HabitRecord): Promise<void>;

  /**
   * IDで習慣実行記録を取得
   */
  findById(id: HabitRecordId): Promise<HabitRecord | null>;

  /**
   * 習慣IDで実行記録一覧を取得
   */
  findByHabitId(habitId: HabitId): Promise<HabitRecord[]>;

  /**
   * 日付範囲で実行記録を取得
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<HabitRecord[]>;

  /**
   * 特定の習慣の日付範囲での実行記録を取得
   */
  findByHabitIdAndDateRange(
    habitId: HabitId,
    startDate: Date,
    endDate: Date
  ): Promise<HabitRecord[]>;

  /**
   * 特定の習慣の特定日の実行記録を取得
   */
  findByHabitIdAndDate(habitId: HabitId, date: Date): Promise<HabitRecord[]>;

  /**
   * 今日の実行記録を取得
   */
  findTodayRecords(): Promise<HabitRecord[]>;

  /**
   * 特定の習慣の今日の実行記録を取得
   */
  findTodayRecordsByHabitId(habitId: HabitId): Promise<HabitRecord[]>;

  /**
   * 習慣実行記録を削除（物理削除）
   */
  delete(id: HabitRecordId): Promise<void>;

  /**
   * 特定の習慣の全実行記録を削除
   */
  deleteAllByHabitId(habitId: HabitId): Promise<void>;

  /**
   * 習慣実行記録が存在するかを確認
   */
  exists(id: HabitRecordId): Promise<boolean>;

  /**
   * 特定の習慣・日付で実行記録が存在するかを確認（重複実行チェック用）
   */
  existsByHabitIdAndDate(habitId: HabitId, date: Date): Promise<boolean>;

  /**
   * 特定の習慣の実行記録数を取得
   */
  countByHabitId(habitId: HabitId): Promise<number>;

  /**
   * 特定の習慣の最新実行記録を取得
   */
  findLatestByHabitId(habitId: HabitId): Promise<HabitRecord | null>;
}