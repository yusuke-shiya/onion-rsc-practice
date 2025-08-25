import { z } from 'zod';

/**
 * 習慣作成用DTO
 * フォーム入力からのデータを受け取り、バリデーションを行う
 */

// Zodスキーマ定義 - アプリケーション層でのバリデーション
export const CreateHabitDTOSchema = z.object({
  name: z.string()
    .min(1, '習慣名を入力してください')
    .max(100, '習慣名は100文字以内で入力してください')
    .trim(),
  
  targetFrequency: z.enum(['daily', 'weekly', 'monthly'], {
    message: '実行頻度は daily, weekly, monthly のいずれかを選択してください'
  }),
  
  estimatedDurationMinutes: z.number()
    .int('実行時間は整数で入力してください')
    .min(0, '実行時間は0分以上で入力してください')
    .max(1440, '実行時間は24時間以内で入力してください')
    .optional(),
    
  description: z.string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
});

// DTOの型定義
export type CreateHabitDTO = z.infer<typeof CreateHabitDTOSchema>;

/**
 * CreateHabitDTOのバリデーション結果
 */
export type CreateHabitDTOValidationResult = {
  success: true;
  data: CreateHabitDTO;
} | {
  success: false;
  errors: Array<{
    field: string;
    message: string;
  }>;
};

/**
 * CreateHabitDTOのバリデーションを実行
 */
export function validateCreateHabitDTO(input: unknown): CreateHabitDTOValidationResult {
  const result = CreateHabitDTOSchema.safeParse(input);
  
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
 * CreateHabitDTOからフォームのデフォルト値を生成
 */
export function getCreateHabitFormDefaults(): Partial<CreateHabitDTO> {
  return {
    name: '',
    targetFrequency: 'daily',
    estimatedDurationMinutes: undefined,
    description: undefined,
  };
}