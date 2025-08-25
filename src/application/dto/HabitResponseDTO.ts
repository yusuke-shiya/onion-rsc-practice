import { z } from 'zod';

/**
 * 習慣レスポンス用DTO
 * UI表示用のレスポンスデータ構造を定義
 */

// 基本的な習慣レスポンス
export const HabitResponseDTOSchema = z.object({
  id: z.string().uuid('不正なUUID形式です'),
  name: z.string(),
  description: z.string().nullable(),
  targetFrequency: z.enum(['daily', 'weekly', 'monthly']),
  targetFrequencyDisplay: z.string(), // UI表示用の日本語文字列
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isActive: z.boolean(),
});

// 実行状況付きの習慣レスポンス
export const HabitWithExecutionStatusDTOSchema = HabitResponseDTOSchema.extend({
  executionStatus: z.object({
    isExecutedToday: z.boolean(),
    lastExecutionDate: z.string().datetime().nullable(),
    currentStreak: z.number().int().min(0),
    totalExecutions: z.number().int().min(0),
  })
});

// 詳細な実行記録付きの習慣レスポンス
export const HabitWithRecordsDTOSchema = HabitWithExecutionStatusDTOSchema.extend({
  recentRecords: z.array(z.object({
    id: z.string().uuid(),
    executedAt: z.string().datetime(),
    durationMinutes: z.number().int().min(0).nullable(),
    durationDisplay: z.string().nullable(), // UI表示用の時間文字列
    note: z.string().nullable(),
  })),
  weeklyProgress: z.array(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD形式
    isExecuted: z.boolean(),
  }))
});

// DTOの型定義
export type HabitResponseDTO = z.infer<typeof HabitResponseDTOSchema>;
export type HabitWithExecutionStatusDTO = z.infer<typeof HabitWithExecutionStatusDTOSchema>;
export type HabitWithRecordsDTO = z.infer<typeof HabitWithRecordsDTOSchema>;

/**
 * 習慣一覧レスポンス用DTO
 */
export const HabitsListResponseDTOSchema = z.object({
  habits: z.array(HabitWithExecutionStatusDTOSchema),
  pagination: z.object({
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    totalPages: z.number().int().min(0),
  }).optional(),
});

export type HabitsListResponseDTO = z.infer<typeof HabitsListResponseDTOSchema>;

/**
 * 実行記録レスポンス用DTO
 */
export const ExecutionRecordResponseDTOSchema = z.object({
  id: z.string().uuid(),
  habitId: z.string().uuid(),
  habitName: z.string(),
  executedAt: z.string().datetime(),
  durationMinutes: z.number().int().min(0).nullable(),
  durationDisplay: z.string().nullable(),
  note: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ExecutionRecordResponseDTO = z.infer<typeof ExecutionRecordResponseDTOSchema>;

/**
 * エラーレスポンス用DTO
 */
export const ErrorResponseDTOSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({
      field: z.string().optional(),
      message: z.string(),
    })).optional(),
  }),
});

export type ErrorResponseDTO = z.infer<typeof ErrorResponseDTOSchema>;

/**
 * 成功レスポンス用DTO
 */
export const SuccessResponseDTOSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export type SuccessResponseDTO = z.infer<typeof SuccessResponseDTOSchema>;

/**
 * レスポンスのバリデーション関数群
 */
export function validateHabitResponseDTO(input: unknown) {
  return HabitResponseDTOSchema.safeParse(input);
}

export function validateHabitWithExecutionStatusDTO(input: unknown) {
  return HabitWithExecutionStatusDTOSchema.safeParse(input);
}

export function validateHabitsListResponseDTO(input: unknown) {
  return HabitsListResponseDTOSchema.safeParse(input);
}

/**
 * 空の習慣一覧レスポンスを作成
 */
export function createEmptyHabitsListResponse(): HabitsListResponseDTO {
  return {
    habits: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  };
}

/**
 * エラーレスポンスを作成
 */
export function createErrorResponse(
  code: string, 
  message: string, 
  details?: Array<{ field?: string; message: string }>
): ErrorResponseDTO {
  return {
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * 成功レスポンスを作成
 */
export function createSuccessResponse(message?: string, data?: unknown): SuccessResponseDTO {
  return {
    success: true,
    message,
    data,
  };
}