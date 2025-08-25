import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { DIContainer } from "~/src/infrastructure/di/DIContainer";
import { RecordExecutionUseCase } from "~/src/application/useCases/RecordExecutionUseCase";

// フォーム入力のバリデーションスキーマ
const recordExecutionSchema = z.object({
  habitId: z.string().uuid('不正なHabit IDです'),
  executedAt: z.string().datetime('不正な日時形式です'),
  durationMinutes: z.string().optional().transform((val) => {
    if (!val) return undefined;
    const num = parseInt(val, 10);
    return isNaN(num) ? undefined : num;
  }),
  note: z.string().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  // POSTメソッドのみ受け付ける
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // フォームデータの取得
    const formData = await request.formData();
    const rawData = {
      habitId: formData.get('habitId')?.toString() || '',
      executedAt: formData.get('executedAt')?.toString() || '',
      durationMinutes: formData.get('durationMinutes')?.toString(),
      note: formData.get('note')?.toString(),
    };

    // バリデーション
    const validationResult = recordExecutionSchema.safeParse(rawData);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((error: any) => ({
        field: error.path.join('.'),
        message: error.message,
      }));

      return json({
        error: '入力データが正しくありません',
        details: errors,
      }, { status: 400 });
    }

    const validatedData = validationResult.data;

    // DIコンテナからUse Caseを取得
    const container = DIContainer.getInstance();
    const recordExecutionUseCase = new RecordExecutionUseCase(
      container.habitRepository,
      container.habitRecordRepository
    );

    // 実行記録を追加
    const result = await recordExecutionUseCase.execute({
      habitId: validatedData.habitId,
      executedAt: validatedData.executedAt,
      durationMinutes: validatedData.durationMinutes,
      note: validatedData.note || undefined,
    });

    if (!result.success) {
      return json({
        error: result.error.message,
      }, { status: 400 });
    }

    return json({
      success: true,
      data: {
        recordId: result.data.id,
        message: '実行記録を追加しました',
      },
    });

  } catch (error) {
    console.error('実行記録の追加中にエラーが発生しました:', error);
    
    return json({
      error: 'サーバーエラーが発生しました。しばらく待ってから再試行してください。',
    }, { status: 500 });
  }
}

// GETメソッドは使用しない
export function loader() {
  return json({ error: 'Method not allowed' }, { status: 405 });
}