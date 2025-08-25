import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { DIContainer } from "~/src/utils/server-only";
import { GetHabitsUseCase } from "~/src/application/useCases/GetHabitsUseCase";
import { HabitDetailView } from "~/src/presentation/components/HabitDetailView";
import type { HabitWithRecordsDTO } from "~/src/application/dto";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.habit) {
    return [
      { title: "習慣が見つかりません - 習慣トラッカー" },
    ];
  }
  
  return [
    { title: `${data.habit.name} - 習慣トラッカー` },
    { name: "description", content: `${data.habit.name}の詳細と実行履歴を確認しましょう` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const habitId = params.id;
  
  if (!habitId) {
    throw new Response("Habit ID is required", { status: 400 });
  }

  try {
    // DIコンテナからUse Caseを取得
    const container = await DIContainer.getInstance();
    const getHabitsUseCase = new GetHabitsUseCase(
      container.habitRepository,
      container.habitRecordRepository,
      container.habitProgressService
    );

    // 全習慣を取得して該当するIDのものを検索
    const result = await getHabitsUseCase.execute({ includeInactive: true });
    
    if (!result.success) {
      throw new Error(result.error.message);
    }

    const targetHabit = result.data.habits.find(habit => habit.id === habitId);
    
    if (!targetHabit) {
      throw new Response("習慣が見つかりませんでした", { status: 404 });
    }

    // 週間進捗データを生成（簡易版 - 今週の日付配列を作成）
    const weeklyProgress = generateWeeklyProgress(targetHabit);

    // 最近の実行記録を模擬データとして生成（実際の実装では別途取得）
    const recentRecords = await getRecentRecords(container, habitId);

    const habitWithRecords: HabitWithRecordsDTO = {
      ...targetHabit,
      recentRecords,
      weeklyProgress,
    };

    return json({ habit: habitWithRecords });

  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    
    console.error('習慣詳細の取得に失敗しました:', error);
    throw new Response("習慣の取得中にエラーが発生しました", { status: 500 });
  }
}

// 週間進捗データを生成する関数
function generateWeeklyProgress(habit: any) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // 日曜日を週の開始とする

  const weeklyProgress = [];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    
    weeklyProgress.push({
      date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
      isExecuted: Math.random() > 0.5, // 模擬データ（実際の実装では実行記録から判定）
    });
  }
  
  return weeklyProgress;
}

// 最近の実行記録を取得する関数（簡易版）
async function getRecentRecords(container: any, habitId: string) {
  try {
    // 実際の実装では HabitRecordRepository から取得
    const records = await container.habitRecordRepository.findByHabitId({ toString: () => habitId });
    
    return records.slice(0, 10).map((record: any) => ({
      id: record.id.toString(),
      executedAt: record.executedAt.toISOString(),
      durationMinutes: record.duration?.toMinutes() || null,
      durationDisplay: record.duration ? record.duration.toString() : null,
      note: record.note || null,
    }));
  } catch (error) {
    console.error('実行記録の取得に失敗しました:', error);
    return [];
  }
}

export default function HabitDetail({ loaderData }: { loaderData: { habit: HabitWithRecordsDTO } }) {
  const { habit } = loaderData;
  
  return <HabitDetailView habit={habit} />;
}