import { Habit } from '../../domain/entities/Habit';
import { HabitRecord } from '../../domain/entities/HabitRecord';
import { HabitRepository } from '../../domain/repositories/HabitRepository';
import { HabitRecordRepository } from '../../domain/repositories/HabitRecordRepository';
import { HabitProgressService } from '../../domain/services/HabitProgressService';
import { HabitsListResponseDTO, HabitWithExecutionStatusDTO, createEmptyHabitsListResponse } from '../dto';
import { Result, success, failure } from '../types/Result';
import { 
  ApplicationError, 
  TechnicalError,
  ApplicationErrorFactory 
} from '../errors/ApplicationError';

/**
 * 習慣一覧取得用のオプション
 */
export interface GetHabitsOptions {
  includeInactive?: boolean;
  page?: number;
  limit?: number;
}

/**
 * 習慣一覧取得Use Case
 * 習慣一覧を取得し、実行状況を付加して返す
 */
export class GetHabitsUseCase {
  constructor(
    private readonly habitRepository: HabitRepository,
    private readonly habitRecordRepository: HabitRecordRepository,
    private readonly progressService: HabitProgressService
  ) {}

  /**
   * 習慣一覧を取得する
   */
  async execute(options: GetHabitsOptions = {}): Promise<Result<HabitsListResponseDTO, ApplicationError>> {
    try {
      // Step 1: 習慣一覧の取得
      const habitsResult = await this.fetchHabits(options);
      if (!habitsResult.success) {
        return habitsResult;
      }

      const habits = habitsResult.data;

      // 習慣がない場合は空のレスポンスを返す
      if (habits.length === 0) {
        return success(createEmptyHabitsListResponse());
      }

      // Step 2: 各習慣の実行記録を取得
      const recordsResult = await this.fetchHabitsRecords(habits);
      if (!recordsResult.success) {
        return recordsResult;
      }

      const recordsByHabitId = recordsResult.data;

      // Step 3: 実行状況を付加したDTOを作成
      const habitsWithStatus = habits.map(habit => 
        this.createHabitWithExecutionStatusDTO(habit, recordsByHabitId.get(habit.id.toString()) || [])
      );

      // Step 4: ページネーション情報を含むレスポンスを作成
      const response = this.createHabitsListResponse(habitsWithStatus, options, habits.length);
      
      return success(response);

    } catch (error) {
      const applicationError = ApplicationErrorFactory.fromError(error as Error);
      return failure(applicationError);
    }
  }

  /**
   * 習慣一覧を取得
   */
  private async fetchHabits(options: GetHabitsOptions): Promise<Result<Habit[], TechnicalError>> {
    try {
      const habits = options.includeInactive 
        ? await this.habitRepository.findAll()
        : await this.habitRepository.findAllActive();

      return success(habits);

    } catch (error) {
      return failure(new TechnicalError(
        '習慣一覧の取得中にエラーが発生しました',
        error as Error
      ));
    }
  }

  /**
   * 習慣の実行記録を取得
   */
  private async fetchHabitsRecords(habits: Habit[]): Promise<Result<Map<string, HabitRecord[]>, TechnicalError>> {
    try {
      const recordsByHabitId = new Map<string, HabitRecord[]>();

      // 各習慣の実行記録を並列取得
      const recordPromises = habits.map(async (habit) => {
        const records = await this.habitRecordRepository.findByHabitId(habit.id);
        return { habitId: habit.id.toString(), records };
      });

      const recordResults = await Promise.all(recordPromises);
      
      recordResults.forEach(({ habitId, records }) => {
        recordsByHabitId.set(habitId, records);
      });

      return success(recordsByHabitId);

    } catch (error) {
      return failure(new TechnicalError(
        '実行記録の取得中にエラーが発生しました',
        error as Error
      ));
    }
  }

  /**
   * 実行状況付きの習慣DTOを作成
   */
  private createHabitWithExecutionStatusDTO(habit: Habit, records: HabitRecord[]): HabitWithExecutionStatusDTO {
    // 実行状況を計算
    const isExecutedToday = this.progressService.isTodayCompleted(records);
    const lastExecutionDate = this.progressService.getLastExecutedDate(records);
    const currentStreak = this.progressService.calculateStreak(records, habit);
    const totalExecutions = this.progressService.getTotalExecutions(records);

    return {
      id: habit.id.toString(),
      name: habit.name.value,
      description: habit.description || null,
      targetFrequency: habit.targetFrequency.getValue(),
      targetFrequencyDisplay: habit.targetFrequency.toJapanese(),
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
      isActive: habit.isActive,
      executionStatus: {
        isExecutedToday,
        lastExecutionDate: lastExecutionDate?.toISOString() || null,
        currentStreak,
        totalExecutions,
      },
    };
  }

  /**
   * 習慣一覧レスポンスを作成
   */
  private createHabitsListResponse(
    habitsWithStatus: HabitWithExecutionStatusDTO[], 
    options: GetHabitsOptions,
    totalCount: number
  ): HabitsListResponseDTO {
    const page = options.page || 1;
    const limit = options.limit || 10;
    
    // ページネーションを適用（メモリ内で実行）
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHabits = habitsWithStatus.slice(startIndex, endIndex);

    return {
      habits: paginatedHabits,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}

/**
 * 今日実行済みの習慣のみを取得するバリエーション
 */
export class GetTodayExecutedHabitsUseCase extends GetHabitsUseCase {
  async execute(options: GetHabitsOptions = {}): Promise<Result<HabitsListResponseDTO, ApplicationError>> {
    try {
      // 基底の実装で全習慣を取得
      const baseResult = await super.execute(options);
      if (!baseResult.success) {
        return baseResult;
      }

      // 今日実行済みの習慣のみをフィルタリング
      const filteredHabits = baseResult.data.habits.filter(
        habit => habit.executionStatus.isExecutedToday
      );

      return success({
        habits: filteredHabits,
        pagination: baseResult.data.pagination ? {
          ...baseResult.data.pagination,
          total: filteredHabits.length,
          totalPages: Math.ceil(filteredHabits.length / (options.limit || 10)),
        } : undefined,
      });

    } catch (error) {
      const applicationError = ApplicationErrorFactory.fromError(error as Error);
      return failure(applicationError);
    }
  }
}

/**
 * 今日未実行の習慣のみを取得するバリエーション
 */
export class GetTodayPendingHabitsUseCase extends GetHabitsUseCase {
  async execute(options: GetHabitsOptions = {}): Promise<Result<HabitsListResponseDTO, ApplicationError>> {
    try {
      // 基底の実装で全習慣を取得
      const baseResult = await super.execute(options);
      if (!baseResult.success) {
        return baseResult;
      }

      // 今日未実行の習慣のみをフィルタリング
      const filteredHabits = baseResult.data.habits.filter(
        habit => !habit.executionStatus.isExecutedToday
      );

      return success({
        habits: filteredHabits,
        pagination: baseResult.data.pagination ? {
          ...baseResult.data.pagination,
          total: filteredHabits.length,
          totalPages: Math.ceil(filteredHabits.length / (options.limit || 10)),
        } : undefined,
      });

    } catch (error) {
      const applicationError = ApplicationErrorFactory.fromError(error as Error);
      return failure(applicationError);
    }
  }
}