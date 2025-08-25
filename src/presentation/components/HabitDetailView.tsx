import { Link } from "@remix-run/react";
import type { HabitWithRecordsDTO } from "../../application/dto";
import { RecordExecutionButton } from "./RecordExecutionButton";

/**
 * 習慣詳細表示コンポーネント（Server Component）
 * 個別の習慣の詳細情報と実行履歴を表示
 */

interface HabitDetailViewProps {
  habit: HabitWithRecordsDTO;
}

export function HabitDetailView({ habit }: HabitDetailViewProps) {
  const isCompletedToday = habit.executionStatus.isExecutedToday;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ナビゲーション */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ダッシュボードに戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：習慣の基本情報 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                      {habit.name}
                    </h1>
                    {isCompletedToday && (
                      <div className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        今日は完了
                      </div>
                    )}
                  </div>
                  
                  {habit.description && (
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      作成日: {new Date(habit.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>

                <div className="ml-6">
                  <RecordExecutionButton 
                    habitId={habit.id} 
                    habitName={habit.name}
                    isCompleted={isCompletedToday}
                  />
                </div>
              </div>

              {/* 週間進捗表示 */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  今週の進捗
                </h3>
                <div className="flex gap-2">
                  {habit.weeklyProgress.map((day, index) => (
                    <div key={day.date} className="flex-1 text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {['日', '月', '火', '水', '木', '金', '土'][index]}
                      </div>
                      <div
                        className={`h-8 w-full rounded-md flex items-center justify-center ${
                          day.isExecuted
                            ? 'bg-green-100 border-2 border-green-300 dark:bg-green-800/30 dark:border-green-600'
                            : 'bg-gray-100 border-2 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                        }`}
                      >
                        {day.isExecuted && (
                          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(day.date).getDate()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 右側：統計情報 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                統計情報
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">現在の継続日数</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {habit.executionStatus.currentStreak}日
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">総実行回数</span>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {habit.executionStatus.totalExecutions}回
                  </span>
                </div>

                {habit.executionStatus.lastExecutionDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">最終実行</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(habit.executionStatus.lastExecutionDate).toLocaleDateString('ja-JP', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 最近の実行記録 */}
            {habit.recentRecords.length > 0 && (
              <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  最近の実行記録
                </h3>
                
                <div className="space-y-3">
                  {habit.recentRecords.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="flex-shrink-0">
                        <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {new Date(record.executedAt).toLocaleDateString('ja-JP', {
                              month: 'numeric',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                          {record.durationDisplay && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {record.durationDisplay}
                            </span>
                          )}
                        </div>
                        {record.note && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {record.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {habit.recentRecords.length > 5 && (
                  <div className="mt-3 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                      すべての記録を見る
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}