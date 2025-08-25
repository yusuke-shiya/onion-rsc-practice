import { z } from 'zod';
import { HabitRecord } from '../../domain/entities/HabitRecord';
import { HabitId, Duration } from '../../domain/valueObjects';
import { HabitRepository } from '../../domain/repositories/HabitRepository';
import { HabitRecordRepository } from '../../domain/repositories/HabitRecordRepository';
import { ExecutionRecordResponseDTO } from '../dto';
import { Result, success, failure } from '../types/Result';
import { 
  ApplicationError, 
  ValidationError, 
  NotFoundError, 
  ConflictError,
  BusinessRuleError,
  TechnicalError,
  ApplicationErrorFactory 
} from '../errors/ApplicationError';

/**
 * 実行記録作成用DTO
 */
export const RecordExecutionDTOSchema = z.object({
  habitId: z.string().uuid('不正なUUID形式です'),
  executedAt: z.string().datetime('不正な日時形式です').optional(),
  durationMinutes: z.number()
    .int('実行時間は整数で入力してください')
    .min(0, '実行時間は0分以上で入力してください')
    .max(1440, '実行時間は24時間以内で入力してください')
    .optional(),
  note: z.string()
    .max(500, 'ノートは500文字以内で入力してください')
    .optional(),
});

export type RecordExecutionDTO = z.infer<typeof RecordExecutionDTOSchema>;

/**
 * RecordExecutionDTOのバリデーション結果
 */
export type RecordExecutionDTOValidationResult = {
  success: true;
  data: RecordExecutionDTO;
} | {
  success: false;
  errors: Array<{
    field: string;
    message: string;
  }>;
};

/**
 * RecordExecutionDTOのバリデーションを実行
 */
export function validateRecordExecutionDTO(input: unknown): RecordExecutionDTOValidationResult {
  const result = RecordExecutionDTOSchema.safeParse(input);
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }
  
  return {
    success: false,
    errors: result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }))
  };
}

/**
 * 実行記録作成Use Case
 * 習慣の実行記録を作成し、重複チェックやビジネスルールを適用する
 */
export class RecordExecutionUseCase {
  constructor(
    private readonly habitRepository: HabitRepository,
    private readonly habitRecordRepository: HabitRecordRepository
  ) {}

  /**
   * 実行記録を作成する
   */
  async execute(input: unknown): Promise<Result<ExecutionRecordResponseDTO, ApplicationError>> {
    try {
      // Step 1: 入力値のバリデーション
      const validationResult = this.validateInput(input);
      if (!validationResult.success) {
        return validationResult;
      }
      
      const dto = validationResult.data;

      // Step 2: 習慣の存在確認
      const habitResult = await this.validateHabitExists(dto.habitId);
      if (!habitResult.success) {
        return habitResult;
      }
      
      const habit = habitResult.data;

      // Step 3: ビジネスルールの検証
      const businessValidationResult = await this.validateBusinessRules(dto);
      if (!businessValidationResult.success) {
        return businessValidationResult;
      }

      // Step 4: ドメインオブジェクトの作成
      const recordResult = this.createHabitRecord(dto);
      if (!recordResult.success) {
        return recordResult;
      }
      
      const habitRecord = recordResult.data;

      // Step 5: 永続化
      const persistenceResult = await this.persistHabitRecord(habitRecord);
      if (!persistenceResult.success) {
        return persistenceResult;
      }

      // Step 6: レスポンスDTOの作成
      const responseDTO = this.createResponseDTO(habitRecord, habit.name.value);
      
      return success(responseDTO);

    } catch (error) {
      const applicationError = ApplicationErrorFactory.fromError(error as Error);
      return failure(applicationError);
    }
  }

  /**
   * 入力値のバリデーション
   */
  private validateInput(input: unknown): Result<RecordExecutionDTO, ValidationError> {
    const validationResult = validateRecordExecutionDTO(input);
    
    if (!validationResult.success) {
      return failure(new ValidationError(
        '入力データが不正です',
        validationResult.errors
      ));
    }

    return success(validationResult.data);
  }

  /**
   * 習慣の存在確認
   */
  private async validateHabitExists(habitIdString: string): Promise<Result<any, NotFoundError | BusinessRuleError | TechnicalError>> {
    try {
      const habitId = new HabitId(habitIdString);
      const habit = await this.habitRepository.findById(habitId);
      
      if (!habit) {
        return failure(new NotFoundError('Habit', habitIdString));
      }

      if (!habit.isActive) {
        return failure(new BusinessRuleError(
          '非アクティブな習慣には実行記録を追加できません',
          'INACTIVE_HABIT_EXECUTION'
        ));
      }

      return success(habit);

    } catch (error) {
      return failure(new TechnicalError(
        '習慣の確認中にエラーが発生しました',
        error as Error
      ));
    }
  }

  /**
   * ビジネスルールの検証
   */
  private async validateBusinessRules(dto: RecordExecutionDTO): Promise<Result<void, ConflictError | TechnicalError>> {
    try {
      // 実行日時の設定（デフォルトは現在時刻）
      const executedAt = dto.executedAt ? new Date(dto.executedAt) : new Date();
      
      // 同じ習慣の同じ日の実行記録の重複チェック
      const habitId = new HabitId(dto.habitId);
      const existsOnSameDate = await this.habitRecordRepository.existsByHabitIdAndDate(habitId, executedAt);
      
      if (existsOnSameDate) {
        const dateString = executedAt.toISOString().split('T')[0];
        return failure(new ConflictError(
          'HabitRecord',
          'executedAt',
          dateString,
          { message: `${dateString}には既に実行記録が存在します` }
        ));
      }

      return success(void 0);

    } catch (error) {
      return failure(new TechnicalError(
        'ビジネスルールの検証中にエラーが発生しました',
        error as Error
      ));
    }
  }

  /**
   * HabitRecordドメインオブジェクトの作成
   */
  private createHabitRecord(dto: RecordExecutionDTO): Result<HabitRecord, ValidationError> {
    try {
      const habitId = new HabitId(dto.habitId);
      const executedAt = dto.executedAt ? new Date(dto.executedAt) : new Date();
      const duration = dto.durationMinutes !== undefined 
        ? Duration.fromMinutes(dto.durationMinutes) 
        : undefined;

      const habitRecord = HabitRecord.create(
        habitId,
        executedAt,
        duration,
        dto.note
      );

      return success(habitRecord);

    } catch (error) {
      return failure(new ValidationError(
        `実行記録の作成に失敗しました: ${(error as Error).message}`
      ));
    }
  }

  /**
   * 実行記録の永続化
   */
  private async persistHabitRecord(habitRecord: HabitRecord): Promise<Result<void, TechnicalError>> {
    try {
      await this.habitRecordRepository.save(habitRecord);
      return success(void 0);

    } catch (error) {
      return failure(new TechnicalError(
        '実行記録の保存中にエラーが発生しました',
        error as Error
      ));
    }
  }

  /**
   * レスポンスDTOの作成
   */
  private createResponseDTO(habitRecord: HabitRecord, habitName: string): ExecutionRecordResponseDTO {
    return {
      id: habitRecord.id.toString(),
      habitId: habitRecord.habitId.toString(),
      habitName: habitName,
      executedAt: habitRecord.executedAt.toISOString(),
      durationMinutes: habitRecord.duration?.toMinutes() || null,
      durationDisplay: habitRecord.duration?.toString() || null,
      note: habitRecord.note || null,
      createdAt: habitRecord.createdAt.toISOString(),
      updatedAt: habitRecord.updatedAt.toISOString(),
    };
  }
}

/**
 * 今日の実行記録を作成するバリエーション（簡略化）
 */
export class RecordTodayExecutionUseCase extends RecordExecutionUseCase {
  /**
   * 今日の実行記録を作成（実行日時は自動的に現在時刻）
   */
  async execute(input: {
    habitId: string;
    durationMinutes?: number;
    note?: string;
  }): Promise<Result<ExecutionRecordResponseDTO, ApplicationError>> {
    const executionInput = {
      ...input,
      executedAt: new Date().toISOString(),
    };

    return super.execute(executionInput);
  }
}