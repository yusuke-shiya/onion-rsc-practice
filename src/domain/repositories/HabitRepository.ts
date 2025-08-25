import { Habit } from '../entities/Habit';
import { HabitId } from '../valueObjects/HabitId';

/**
 * 習慣リポジトリインターフェース
 * Onion Architectureの原則に従い、ドメイン層でインターフェースを定義
 * 実装はInfrastructure層で行う（依存性逆転の原則）
 */
export interface HabitRepository {
  /**
   * 習慣を保存（作成・更新）
   */
  save(habit: Habit): Promise<void>;

  /**
   * IDで習慣を取得
   */
  findById(id: HabitId): Promise<Habit | null>;

  /**
   * ユーザーIDで習慣一覧を取得
   * TODO: 将来的にユーザーIDが追加された時に対応
   */
  findByUserId?(userId: string): Promise<Habit[]>;

  /**
   * 全ての習慣を取得
   */
  findAll(): Promise<Habit[]>;

  /**
   * アクティブな習慣のみを取得
   */
  findAllActive(): Promise<Habit[]>;

  /**
   * 習慣を削除（物理削除）
   */
  delete(id: HabitId): Promise<void>;

  /**
   * 習慣が存在するかを確認
   */
  exists(id: HabitId): Promise<boolean>;

  /**
   * 指定された名前の習慣が存在するかを確認（重複チェック用）
   */
  existsByName(name: string): Promise<boolean>;
}