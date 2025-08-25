'use client';

import { useState } from "react";
import { useFetcher } from "@remix-run/react";

/**
 * 実行記録ボタンコンポーネント（Client Component）
 * 習慣の実行記録を行うためのインタラクティブなボタン
 */

interface RecordExecutionButtonProps {
  habitId: string;
  habitName: string;
  isCompleted: boolean;
}

export function RecordExecutionButton({ habitId, habitName, isCompleted }: RecordExecutionButtonProps) {
  const fetcher = useFetcher();
  const [showDurationInput, setShowDurationInput] = useState(false);
  const [duration, setDuration] = useState<number | ''>('');
  const [note, setNote] = useState('');

  const isSubmitting = fetcher.state === "submitting";

  const handleQuickRecord = () => {
    if (isCompleted) {
      // 既に完了済みの場合は何もしない、またはトーストで通知
      return;
    }

    const formData = new FormData();
    formData.append('habitId', habitId);
    formData.append('executedAt', new Date().toISOString());
    
    fetcher.submit(formData, {
      method: 'POST',
      action: '/api/habits/record'
    });
  };

  const handleDetailedRecord = () => {
    if (isCompleted) return;

    const formData = new FormData();
    formData.append('habitId', habitId);
    formData.append('executedAt', new Date().toISOString());
    if (duration && typeof duration === 'number') {
      formData.append('durationMinutes', duration.toString());
    }
    if (note.trim()) {
      formData.append('note', note.trim());
    }
    
    fetcher.submit(formData, {
      method: 'POST',
      action: '/api/habits/record'
    });

    // フォームをリセット
    setShowDurationInput(false);
    setDuration('');
    setNote('');
  };

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="inline-flex items-center px-3 py-2 rounded-md bg-green-50 text-green-700 dark:bg-green-800/30 dark:text-green-400 text-sm font-medium">
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          今日は完了
        </div>
      </div>
    );
  }

  if (showDurationInput) {
    return (
      <div className="flex flex-col gap-3 min-w-48">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            実行時間（分）
          </label>
          <input
            type="number"
            min="1"
            max="1440"
            value={duration}
            onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : '')}
            placeholder="任意"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            メモ
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="任意"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDetailedRecord}
            disabled={isSubmitting}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                記録中...
              </div>
            ) : (
              '記録する'
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setShowDurationInput(false);
              setDuration('');
              setNote('');
            }}
            disabled={isSubmitting}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleQuickRecord}
        disabled={isSubmitting}
        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-24"
      >
        {isSubmitting ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            記録中...
          </div>
        ) : (
          <>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            実行完了
          </>
        )}
      </button>
      
      <button
        type="button"
        onClick={() => setShowDurationInput(true)}
        disabled={isSubmitting}
        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        詳細を追加
      </button>
    </div>
  );
}