import { PrismaClient } from '@prisma/client';
import { HabitRecordRepository } from '../../domain/repositories/HabitRecordRepository';
import { HabitRecord } from '../../domain/entities/HabitRecord';
import { HabitId, HabitRecordId } from '../../domain/valueObjects';
import { HabitRecordConverter } from '../converters/HabitRecordConverter';
import { 
  mapPrismaErrorToRepositoryError, 
  RecordNotFoundError 
} from '../errors';

/**
 * Prisma を使用した HabitRecord Repository の実装
 * Onion Architecture の原則に従い、ドメイン層のインターフェースを実装
 */
export class PrismaHabitRecordRepository implements HabitRecordRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * 習慣実行記録を保存（作成・更新）
   */
  async save(record: HabitRecord): Promise<void> {
    try {
      const exists = await this.exists(record.id);
      
      if (exists) {
        // 更新
        const updateData = HabitRecordConverter.toPrismaUpdate(record);
        await this.prisma.habitRecord.update({
          where: { id: record.id.toString() },
          data: updateData,
        });
      } else {
        // 新規作成
        const createData = HabitRecordConverter.toPrismaCreate(record);
        await this.prisma.habitRecord.create({
          data: createData,
        });
      }
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * IDで習慣実行記録を取得
   */
  async findById(id: HabitRecordId): Promise<HabitRecord | null> {
    try {
      const prismaRecord = await this.prisma.habitRecord.findUnique({
        where: { id: id.toString() },
      });

      return prismaRecord ? HabitRecordConverter.toDomain(prismaRecord) : null;
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * 習慣IDで実行記録一覧を取得
   */
  async findByHabitId(habitId: HabitId): Promise<HabitRecord[]> {
    try {
      const prismaRecords = await this.prisma.habitRecord.findMany({
        where: { habitId: habitId.toString() },
        orderBy: { executedAt: 'desc' },
      });

      return HabitRecordConverter.toDomainList(prismaRecords);
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * 日付範囲で実行記録を取得
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<HabitRecord[]> {
    try {
      const prismaRecords = await this.prisma.habitRecord.findMany({
        where: {
          executedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { executedAt: 'desc' },
      });

      return HabitRecordConverter.toDomainList(prismaRecords);
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * 特定の習慣の日付範囲での実行記録を取得
   */
  async findByHabitIdAndDateRange(
    habitId: HabitId,
    startDate: Date,
    endDate: Date
  ): Promise<HabitRecord[]> {
    try {
      const prismaRecords = await this.prisma.habitRecord.findMany({
        where: {
          habitId: habitId.toString(),
          executedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { executedAt: 'desc' },
      });

      return HabitRecordConverter.toDomainList(prismaRecords);
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * 特定の習慣の特定日の実行記録を取得
   */
  async findByHabitIdAndDate(habitId: HabitId, date: Date): Promise<HabitRecord[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const prismaRecords = await this.prisma.habitRecord.findMany({
        where: {
          habitId: habitId.toString(),
          executedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: { executedAt: 'desc' },
      });

      return HabitRecordConverter.toDomainList(prismaRecords);
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * 今日の実行記録を取得
   */
  async findTodayRecords(): Promise<HabitRecord[]> {
    const today = new Date();
    return this.findByDateRange(
      new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
    );
  }

  /**
   * 特定の習慣の今日の実行記録を取得
   */
  async findTodayRecordsByHabitId(habitId: HabitId): Promise<HabitRecord[]> {
    const today = new Date();
    return this.findByHabitIdAndDate(habitId, today);
  }

  /**
   * 習慣実行記録を削除（物理削除）
   */
  async delete(id: HabitRecordId): Promise<void> {
    try {
      const result = await this.prisma.habitRecord.delete({
        where: { id: id.toString() },
      });

      if (!result) {
        throw new RecordNotFoundError('HabitRecord', id.toString());
      }
    } catch (error) {
      // P2025: Record to delete does not exist
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
        throw new RecordNotFoundError('HabitRecord', id.toString(), error);
      }
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * 特定の習慣の全実行記録を削除
   */
  async deleteAllByHabitId(habitId: HabitId): Promise<void> {
    try {
      await this.prisma.habitRecord.deleteMany({
        where: { habitId: habitId.toString() },
      });
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * 習慣実行記録が存在するかを確認
   */
  async exists(id: HabitRecordId): Promise<boolean> {
    try {
      const count = await this.prisma.habitRecord.count({
        where: { id: id.toString() },
      });
      return count > 0;
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * 特定の習慣・日付で実行記録が存在するかを確認（重複実行チェック用）
   */
  async existsByHabitIdAndDate(habitId: HabitId, date: Date): Promise<boolean> {
    try {
      const records = await this.findByHabitIdAndDate(habitId, date);
      return records.length > 0;
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * 特定の習慣の実行記録数を取得
   */
  async countByHabitId(habitId: HabitId): Promise<number> {
    try {
      return await this.prisma.habitRecord.count({
        where: { habitId: habitId.toString() },
      });
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }

  /**
   * 特定の習慣の最新実行記録を取得
   */
  async findLatestByHabitId(habitId: HabitId): Promise<HabitRecord | null> {
    try {
      const prismaRecord = await this.prisma.habitRecord.findFirst({
        where: { habitId: habitId.toString() },
        orderBy: { executedAt: 'desc' },
      });

      return prismaRecord ? HabitRecordConverter.toDomain(prismaRecord) : null;
    } catch (error) {
      throw mapPrismaErrorToRepositoryError(error);
    }
  }
}