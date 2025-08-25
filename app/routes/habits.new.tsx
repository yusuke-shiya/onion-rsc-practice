import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { z } from "zod";
import { DIContainer } from "~/src/utils/server-only";
import { CreateHabitUseCase } from "~/src/application/useCases/CreateHabitUseCase";
import { CreateHabitForm } from "~/src/presentation/components/CreateHabitForm";
import { CreateHabitDTOSchema } from "~/src/application/dto";

export const meta: MetaFunction = () => {
  return [
    { title: "新しい習慣を作成 - 習慣トラッカー" },
    { name: "description", content: "新しい習慣を作成して継続的な成長を始めましょう" },
  ];
};

// フォーム入力のバリデーションスキーマ
const formDataSchema = z.object({
  name: z.string().min(1, '習慣名は必須です').max(100, '習慣名は100文字以内で入力してください'),
  description: z.string().max(500, '説明は500文字以内で入力してください').optional(),
  targetFrequency: z.enum(['daily', 'weekly', 'monthly']).refine(
    (val) => ['daily', 'weekly', 'monthly'].includes(val), 
    { message: '有効な頻度を選択してください' }
  ),
});

export async function action({ request }: ActionFunctionArgs) {
  try {
    // フォームデータの取得
    const formData = await request.formData();
    const rawData = {
      name: formData.get('name')?.toString() || '',
      description: formData.get('description')?.toString() || '',
      targetFrequency: formData.get('targetFrequency')?.toString() || 'daily',
    };

    // バリデーション
    const validationResult = formDataSchema.safeParse(rawData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((error) => {
        if (error.path.length > 0) {
          const field = error.path[0].toString();
          fieldErrors[field] = error.message;
        }
      });

      return json({
        error: 'フォームの入力内容に問題があります。修正してください。',
        fieldErrors,
        values: rawData,
      }, { status: 400 });
    }

    const validatedData = validationResult.data;

    // DTOの作成とバリデーション
    const createHabitDTO = {
      name: validatedData.name,
      description: validatedData.description || undefined,
      targetFrequency: validatedData.targetFrequency,
    };

    const dtoValidationResult = CreateHabitDTOSchema.safeParse(createHabitDTO);
    if (!dtoValidationResult.success) {
      return json({
        error: '入力データの形式が正しくありません',
        values: rawData,
      }, { status: 400 });
    }

    // DIコンテナからUse Caseを取得
    const container = DIContainer.getInstance();
    const createHabitUseCase = new CreateHabitUseCase(
      container.habitRepository
    );

    // 習慣を作成
    const result = await createHabitUseCase.execute(dtoValidationResult.data);
    
    if (!result.success) {
      return json({
        error: result.error.message,
        values: rawData,
      }, { status: 400 });
    }

    // 成功時はダッシュボードにリダイレクト
    return redirect('/');

  } catch (error) {
    console.error('習慣作成中にエラーが発生しました:', error);
    
    // 元のフォームデータを保持してエラーを返す
    const formData = await request.formData();
    const rawData = {
      name: formData.get('name')?.toString() || '',
      description: formData.get('description')?.toString() || '',
      targetFrequency: formData.get('targetFrequency')?.toString() || 'daily',
    };

    return json({
      error: 'サーバーエラーが発生しました。しばらく待ってから再試行してください。',
      values: rawData,
    }, { status: 500 });
  }
}

export default function NewHabit() {
  return <CreateHabitForm />;
}