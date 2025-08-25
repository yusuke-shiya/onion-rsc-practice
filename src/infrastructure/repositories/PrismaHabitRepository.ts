import { PrismaClient } from '@prisma/client';
import { HabitRepository } from '../../domain/repositories/HabitRepository';
import { Habit } from '../../domain/entities/Habit';
import { HabitId } from '../../domain/valueObjects/HabitId';
import { HabitConverter } from '../converters/HabitConverter';
import { 
  mapPrismaErrorToRepositoryError, 
  RecordNotFoundError,
  ConstraintViolationError 
} from '../errors';

/**
 * Prisma を使用した Habit Repository の実装
 * Onion Architecture の原則に従い、ドメイン層のインターフェースを実装
 */
export class PrismaHabitRepository implements HabitRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly defaultUserId: string = 'default' // TODO: 将来的には認証から取得
  ) {}

  /**
   * 習慣を保存（作成・更新）
   */
  async save(habit: Habit): Promise<void> {
    try {
      const exists = await this.exists(habit.id);
      
      if (exists) {
        // 更新
        const updateData = HabitConverter.toPrismaUpdate(habit);
        await this.prisma.habit.update({
          where: { id: habit.id.toString() },
          data: updateData,
        });
      } else {
        // 新規作成
        const createData = HabitConverter.toPrismaCreate(habit, this.defaultUserId);
        await this.prisma.habit.create({
          data: createData,
        });
      }
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * IDで習慣を取得
   */
  async findById(id: HabitId): Promise<Habit | null> {
    try {
      const prismaHabit = await this.prisma.habit.findUnique({
        where: { id: id.toString() },
      });

      return prismaHabit ? HabitConverter.toDomain(prismaHabit) : null;
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * ユーザーIDで習慣一覧を取得
   */
  async findByUserId(userId: string): Promise<Habit[]> {
    try {
      const prismaHabits = await this.prisma.habit.findMany({
        where: { 
          userId,
          isActive: true // アクティブなもののみ
        },
        orderBy: { createdAt: 'desc' },
      });

      return prismaHabits.map(habit => HabitConverter.toDomain(habit));
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * 全ての習慣を取得
   */
  async findAll(): Promise<Habit[]> {
    try {
      const prismaHabits = await this.prisma.habit.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return prismaHabits.map(habit => HabitConverter.toDomain(habit));
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * アクティブな習慣のみを取得
   */
  async findAllActive(): Promise<Habit[]> {
    try {
      const prismaHabits = await this.prisma.habit.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      return prismaHabits.map(habit => HabitConverter.toDomain(habit));
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * 習慣を削除（物理削除）
   */
  async delete(id: HabitId): Promise<void> {
    try {
      const result = await this.prisma.habit.delete({
        where: { id: id.toString() },
      });

      if (!result) {
        throw new RecordNotFoundError('Habit', id.toString());
      }
    } catch (error) {
      // P2025: Record to delete does not exist
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
        throw new RecordNotFoundError('Habit', id.toString(), error);
      }
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * 習慣が存在するかを確認
   */
  async exists(id: HabitId): Promise<boolean> {
    try {
      const count = await this.prisma.habit.count({
        where: { id: id.toString() },
      });
      return count > 0;
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * 指定された名前の習慣が存在するかを確認（重複チェック用）
   */
  async existsByName(name: string): Promise<boolean> {
    try {
      const count = await this.prisma.habit.count({
        where: { 
          name,
          isActive: true // アクティブなもののみをチェック
        },
      });
      return count > 0;
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }
}