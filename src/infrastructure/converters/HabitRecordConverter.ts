import { HabitRecord as PrismaHabitRecord } from '@prisma/client';
import { HabitRecord } from '../../domain/entities/HabitRecord';
import { HabitId, HabitRecordId, Duration } from '../../domain/valueObjects';

/**
 * HabitRecord エンティティと Prisma HabitRecord モデル間の変換を行うコンバーター
 */
export class HabitRecordConverter {
  /**
   * Prisma HabitRecord モデルを Domain HabitRecord エンティティに変換
   */
  static toDomain(prismaRecord: PrismaHabitRecord): HabitRecord {
    const recordId = new HabitRecordId(prismaRecord.id);
    const habitId = new HabitId(prismaRecord.habitId);
    const duration = prismaRecord.duration ? Duration.fromMinutes(prismaRecord.duration) : undefined;

    return HabitRecord.reconstruct(
      recordId,
      habitId,
      prismaRecord.executedAt,
      duration,
      prismaRecord.note || undefined,
      prismaRecord.createdAt,
      prismaRecord.createdAt // PrismaスキーマにupdatedAtがないため、createdAtを使用
    );
  }

  /**
   * Domain HabitRecord エンティティを Prisma HabitRecord モデルに変換（更新用）
   */
  static toPrismaUpdate(domainRecord: HabitRecord): Omit<PrismaHabitRecord, 'createdAt' | 'habit'> {
    return {
      id: domainRecord.id.toString(),
      habitId: domainRecord.habitId.toString(),
      executedAt: domainRecord.executedAt,
      duration: domainRecord.duration?.toMinutes() || null,
      note: domainRecord.note || null,
    };
  }

  /**
   * Domain HabitRecord エンティティから新規作成用のPrismaデータを作成
   */
  static toPrismaCreate(domainRecord: HabitRecord): Omit<PrismaHabitRecord, 'habit'> {
    return {
      id: domainRecord.id.toString(),
      habitId: domainRecord.habitId.toString(),
      executedAt: domainRecord.executedAt,
      duration: domainRecord.duration?.toMinutes() || null,
      note: domainRecord.note || null,
      createdAt: domainRecord.createdAt,
    };
  }

  /**
   * 複数のPrisma HabitRecordを Domain HabitRecord エンティティに変換
   */
  static toDomainList(prismaRecords: PrismaHabitRecord[]): HabitRecord[] {
    return prismaRecords.map(record => this.toDomain(record));
  }
}