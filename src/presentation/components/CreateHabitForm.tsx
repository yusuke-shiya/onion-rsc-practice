'use client';

import { useState } from "react";
import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import type { CreateHabitDTO } from "../../application/dto";

/**
 * 習慣作成フォームコンポーネント（Client Component）
 * 新しい習慣を作成するためのインタラクティブなフォーム
 */

interface CreateHabitFormProps {
  initialValues?: Partial<CreateHabitDTO>;
}

interface ActionData {
  error?: string;
  fieldErrors?: {
    name?: string;
    description?: string;
    targetFrequency?: string;
  };
  values?: CreateHabitDTO;
}

export function CreateHabitForm({ initialValues }: CreateHabitFormProps) {
  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [formData, setFormData] = useState<CreateHabitDTO>({
    name: initialValues?.name || actionData?.values?.name || '',
    description: initialValues?.description || actionData?.values?.description || '',
    targetFrequency: initialValues?.targetFrequency || actionData?.values?.targetFrequency || 'daily',
  });

  const handleInputChange = (field: keyof CreateHabitDTO, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              新しい習慣を作成
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              継続したい新しい習慣の情報を入力してください
            </p>
          </div>

          <Form method="post" className="p-6">
            {/* 全体エラーメッセージ */}
            {actionData?.error && (
              <div className="mb-6 p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/30 dark:border-red-800">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      エラーが発生しました
                    </h3>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                      {actionData.error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* 習慣名 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  習慣名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    actionData?.fieldErrors?.name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  } rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-gray-700 dark:text-white`}
                  placeholder="例: 毎日30分読書する"
                  maxLength={100}
                  required
                />
                {actionData?.fieldErrors?.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {actionData.fieldErrors.name}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formData.name.length}/100文字
                </p>
              </div>

              {/* 説明 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  説明（任意）
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    actionData?.fieldErrors?.description 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  } rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-gray-700 dark:text-white resize-none`}
                  placeholder="この習慣について詳しく説明してください（任意）"
                  maxLength={500}
                />
                {actionData?.fieldErrors?.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {actionData.fieldErrors.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {(formData.description || '').length}/500文字
                </p>
              </div>

              {/* 頻度 */}
              <div>
                <label htmlFor="targetFrequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  実行頻度 <span className="text-red-500">*</span>
                </label>
                <select
                  id="targetFrequency"
                  name="targetFrequency"
                  value={formData.targetFrequency}
                  onChange={(e) => handleInputChange('targetFrequency', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    actionData?.fieldErrors?.targetFrequency 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  } rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-gray-700 dark:text-white`}
                  required
                >
                  <option value="daily">毎日</option>
                  <option value="weekly">週1回</option>
                  <option value="monthly">月1回</option>
                </select>
                {actionData?.fieldErrors?.targetFrequency && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {actionData.fieldErrors.targetFrequency}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  この習慣をどのくらいの頻度で実行したいですか？
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <Link
                to="/"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-24"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    作成中...
                  </div>
                ) : (
                  '習慣を作成'
                )}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}