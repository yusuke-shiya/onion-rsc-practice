import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { DIContainer } from "~/src/utils/server-only";
import { GetHabitsUseCase } from "~/src/application/useCases/GetHabitsUseCase";
import { HabitList } from "~/src/presentation/components/HabitList";
import type { HabitWithExecutionStatusDTO } from "~/src/application/dto";

export const meta: MetaFunction = () => {
  return [
    { title: "習慣トラッカー - ダッシュボード" },
    { name: "description", content: "習慣トラッカーで継続的な成長を追跡しましょう" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // DIコンテナからUse Caseを取得
    const container = await DIContainer.getInstance();
    const getHabitsUseCase = new GetHabitsUseCase(
      container.habitRepository,
      container.habitRecordRepository,
      container.habitProgressService
    );

    // 習慣一覧を取得
    const result = await getHabitsUseCase.execute({ includeInactive: false });
    
    if (!result.success) {
      throw new Error(result.error.message);
    }

    return {
      habits: result.data.habits,
    };
  } catch (error) {
    console.error('習慣一覧の取得に失敗しました:', error);
    return {
      habits: [] as HabitWithExecutionStatusDTO[],
    };
  }
}

export default function Index() {
  const { habits } = useLoaderData<{ habits: HabitWithExecutionStatusDTO[] }>();
  const completedToday = habits.filter(h => h.executionStatus.isExecutedToday).length;
  const totalHabits = habits.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                習慣トラッカー
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                継続的な成長を記録して、より良い習慣を築きましょう
              </p>
            </div>
            <Link
              to="/habits/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新しい習慣を追加
            </Link>
          </div>
        </div>

        {/* 統計情報 */}
        {totalHabits > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        登録習慣数
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                        {totalHabits}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        今日の完了数
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                        {completedToday}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        達成率
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                        {totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 習慣一覧 */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              今日の習慣
            </h2>
          </div>
          <div className="p-6">
            <HabitList habits={habits} />
          </div>
        </div>
      </div>
    </div>
  );
}
