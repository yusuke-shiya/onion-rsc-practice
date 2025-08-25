import { Habit as PrismaHabit, TargetFrequency as PrismaTargetFrequency } from '../../../generated/prisma';
import { Habit } from '../../domain/entities/Habit';
import { HabitId, HabitName, TargetFrequency, TargetFrequencyType } from '../../domain/valueObjects';

/**
 * Habit エンティティと Prisma Habit モデル間の変換を行うコンバーター
 */
export class HabitConverter {
  /**
   * Prisma Habit モデルを Domain Habit エンティティに変換
   */
  static toDomain(prismaHabit: PrismaHabit): Habit {
    const habitId = new HabitId(prismaHabit.id);
    const habitName = new HabitName(prismaHabit.name);
    const targetFrequency = this.mapPrismaTargetFrequencyToDomain(prismaHabit.targetFrequency);

    return Habit.reconstruct(
      habitId,
      habitName,
      undefined, // Prismaスキーマにdescriptionがないため
      targetFrequency,
      prismaHabit.createdAt,
      prismaHabit.updatedAt,
      prismaHabit.isActive
    );
  }

  /**
   * Domain Habit エンティティを Prisma Habit モデルに変換
   * 注意: idは既存のものを使用し、createdAtは保持される
   */
  static toPrismaUpdate(domainHabit: Habit): Omit<PrismaHabit, 'createdAt' | 'userId' | 'habitRecords'> {
    return {
      id: domainHabit.id.toString(),
      name: domainHabit.name.toString(),
      targetFrequency: this.mapDomainTargetFrequencyToPrisma(domainHabit.targetFrequency),
      isActive: domainHabit.isActive,
      updatedAt: domainHabit.updatedAt,
    };
  }

  /**
   * Domain Habit エンティティから新規作成用のPrismaデータを作成
   */
  static toPrismaCreate(domainHabit: Habit, userId: string): Omit<PrismaHabit, 'habitRecords'> {
    return {
      id: domainHabit.id.toString(),
      name: domainHabit.name.toString(),
      targetFrequency: this.mapDomainTargetFrequencyToPrisma(domainHabit.targetFrequency),
      isActive: domainHabit.isActive,
      userId,
      createdAt: domainHabit.createdAt,
      updatedAt: domainHabit.updatedAt,
    };
  }

  /**
   * Prisma TargetFrequency を Domain TargetFrequency に変換
   */
  private static mapPrismaTargetFrequencyToDomain(prismaFrequency: PrismaTargetFrequency): TargetFrequency {
    switch (prismaFrequency) {
      case 'DAILY':
        return new TargetFrequency(TargetFrequencyType.DAILY);
      case 'WEEKLY':
        return new TargetFrequency(TargetFrequencyType.WEEKLY);
      case 'MONTHLY':
        return new TargetFrequency(TargetFrequencyType.MONTHLY);
      default:
        // デフォルトは日次
        return new TargetFrequency(TargetFrequencyType.DAILY);
    }
  }

  /**
   * Domain TargetFrequency を Prisma TargetFrequency に変換
   */
  private static mapDomainTargetFrequencyToPrisma(domainFrequency: TargetFrequency): PrismaTargetFrequency {
    const value = domainFrequency.getValue();
    switch (value) {
      case TargetFrequencyType.DAILY:
        return 'DAILY';
      case TargetFrequencyType.WEEKLY:
        return 'WEEKLY';
      case TargetFrequencyType.MONTHLY:
        return 'MONTHLY';
      default:
        // デフォルトは日次
        return 'DAILY';
    }
  }
}