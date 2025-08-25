import { Habit } from '../../domain/entities/Habit';
import { HabitName, TargetFrequency } from '../../domain/valueObjects';
import { HabitRepository } from '../../domain/repositories/HabitRepository';
import { CreateHabitDTO, HabitResponseDTO, validateCreateHabitDTO } from '../dto';
import { Result, success, failure } from '../types/Result';
import { 
  ApplicationError, 
  ValidationError, 
  ConflictError, 
  TechnicalError,
  ApplicationErrorFactory 
} from '../errors/ApplicationError';

/**
 * 習慣作成Use Case
 * 習慣作成の業務フローを管理し、ドメインロジックを適切に調整する
 */
export class CreateHabitUseCase {
  constructor(
    private readonly habitRepository: HabitRepository
  ) {}

  /**
   * 習慣を作成する
   */
  async execute(input: unknown): Promise<Result<HabitResponseDTO, ApplicationError>> {
    try {
      // Step 1: 入力値のバリデーション
      const validationResult = this.validateInput(input);
      if (!validationResult.success) {
        return validationResult;
      }
      
      const dto = validationResult.data;

      // Step 2: ビジネスルールの検証
      const businessValidationResult = await this.validateBusinessRules(dto);
      if (!businessValidationResult.success) {
        return businessValidationResult;
      }

      // Step 3: ドメインオブジェクトの作成
      const domainObjectResult = this.createDomainObjects(dto);
      if (!domainObjectResult.success) {
        return domainObjectResult;
      }
      
      const habit = domainObjectResult.data;

      // Step 4: 永続化
      const persistenceResult = await this.persistHabit(habit);
      if (!persistenceResult.success) {
        return persistenceResult;
      }

      // Step 5: レスポンスDTOの作成
      const responseDTO = this.createResponseDTO(habit);
      
      return success(responseDTO);

    } catch (error) {
      // 予期しないエラーを適切にハンドリング
      const applicationError = ApplicationErrorFactory.fromError(error as Error);
      return failure(applicationError);
    }
  }

  /**
   * 入力値のバリデーション
   */
  private validateInput(input: unknown): Result<CreateHabitDTO, ValidationError> {
    const validationResult = validateCreateHabitDTO(input);
    
    if (!validationResult.success) {
      return failure(new ValidationError(
        '入力データが不正です',
        validationResult.errors
      ));
    }

    return success(validationResult.data);
  }

  /**
   * ビジネスルールの検証
   */
  private async validateBusinessRules(dto: CreateHabitDTO): Promise<Result<void, ConflictError | TechnicalError>> {
    try {
      // 習慣名の重複チェック
      const existsWithSameName = await this.habitRepository.existsByName(dto.name);
      
      if (existsWithSameName) {
        return failure(new ConflictError(
          'Habit',
          'name',
          dto.name,
          { message: '同じ名前の習慣がすでに存在します' }
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
   * ドメインオブジェクトの作成
   */
  private createDomainObjects(dto: CreateHabitDTO): Result<Habit, ValidationError> {
    try {
      // Value Objectsを作成
      const habitName = new HabitName(dto.name);
      const targetFrequency = new TargetFrequency(dto.targetFrequency);

      // Habitエンティティを作成
      const habit = Habit.create(
        habitName,
        dto.description || undefined,
        targetFrequency
      );

      return success(habit);

    } catch (error) {
      // ドメインオブジェクト作成時のエラーはバリデーションエラーとして扱う
      return failure(new ValidationError(
        `ドメインオブジェクトの作成に失敗しました: ${(error as Error).message}`
      ));
    }
  }

  /**
   * 習慣の永続化
   */
  private async persistHabit(habit: Habit): Promise<Result<void, TechnicalError>> {
    try {
      await this.habitRepository.save(habit);
      return success(void 0);

    } catch (error) {
      return failure(new TechnicalError(
        '習慣の保存中にエラーが発生しました',
        error as Error
      ));
    }
  }

  /**
   * レスポンスDTOの作成
   */
  private createResponseDTO(habit: Habit): HabitResponseDTO {
    return {
      id: habit.id.toString(),
      name: habit.name.value,
      description: habit.description || null,
      targetFrequency: habit.targetFrequency.getValue(),
      targetFrequencyDisplay: habit.targetFrequency.toJapanese(),
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
      isActive: habit.isActive,
    };
  }
}