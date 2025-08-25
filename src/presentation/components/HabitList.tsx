import { Link } from "@remix-run/react";
import type { HabitWithExecutionStatusDTO } from "../../application/dto";
import { RecordExecutionButton } from "./RecordExecutionButton";

/**
 * 習慣一覧表示コンポーネント（Server Component）
 * 習慣のリストを表示し、実行状況を確認できる
 */

interface HabitListProps {
  habits: HabitWithExecutionStatusDTO[];
}

export function HabitList({ habits }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          習慣がまだありません
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          新しい習慣を作成して、継続的な成長を始めましょう
        </p>
        <Link
          to="/habits/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新しい習慣を作成
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
}

/**
 * 個別の習慣カードコンポーネント
 */
interface HabitCardProps {
  habit: HabitWithExecutionStatusDTO;
}

function HabitCard({ habit }: HabitCardProps) {
  const isCompletedToday = habit.executionStatus.isExecutedToday;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* 左側：習慣の情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
              {habit.name}
            </h3>
            {isCompletedToday && (
              <div className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                完了
              </div>
            )}
          </div>
          
          {habit.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {habit.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {habit.targetFrequencyDisplay}
            </span>
            
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {habit.executionStatus.currentStreak}日継続
            </span>

            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              合計{habit.executionStatus.totalExecutions}回
            </span>
          </div>

          {habit.executionStatus.lastExecutionDate && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              最終実行: {new Date(habit.executionStatus.lastExecutionDate).toLocaleDateString('ja-JP', {
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>

        {/* 右側：アクションボタン */}
        <div className="ml-6 flex flex-col items-end gap-3">
          <RecordExecutionButton 
            habitId={habit.id} 
            habitName={habit.name}
            isCompleted={isCompletedToday}
          />
          
          <Link
            to={`/habits/${habit.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            詳細を見る
          </Link>
        </div>
      </div>
    </div>
  );
}