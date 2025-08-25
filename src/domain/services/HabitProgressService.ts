import { Habit } from '../entities/Habit';
import { HabitRecord } from '../entities/HabitRecord';
import { TargetFrequency } from '../valueObjects/TargetFrequency';

/**
 * 習慣進捗計算サービス
 * 習慣の継続日数や達成率などのビジネスロジックを管理する
 */
export class HabitProgressService {
  /**
   * 継続日数（連続実行日数）を計算
   * 基準日から過去に向かって連続で実行されている日数を返す
   */
  calculateStreak(records: HabitRecord[], habit: Habit, baseDate?: Date): number {
    const targetDate = baseDate || new Date();
    
    // 実行日でソート（最新順）
    const sortedRecords = records
      .slice() // 元配列を変更しないようにコピー
      .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime());

    // 基準日から過去に向かって連続日数をカウント
    let streak = 0;
    const currentDate = new Date(targetDate);
    
    // 時間部分を除去して日付のみで比較
    this.resetTimeToStartOfDay(currentDate);

    for (const record of sortedRecords) {
      const recordDate = new Date(record.executedAt);
      this.resetTimeToStartOfDay(recordDate);

      if (this.isSameDay(recordDate, currentDate)) {
        streak++;
        // 頻度に応じて次の期待日を設定
        this.subtractPeriod(currentDate, habit.targetFrequency);
      } else if (recordDate.getTime() < currentDate.getTime()) {
        // 期待される日付より過去の記録が見つかった場合、連続性が途切れている
        break;
      }
      // recordDate > currentDate の場合は未来の記録なのでスキップ
    }

    return streak;
  }

  /**
   * 達成率を計算
   * 指定期間内での目標に対する実行率を返す
   */
  calculateAchievementRate(
    records: HabitRecord[],
    habit: Habit,
    startDate: Date,
    endDate: Date
  ): number {
    const targetDays = this.calculateTargetDays(habit.targetFrequency, startDate, endDate);
    
    if (targetDays === 0) {
      return 100; // 目標日数が0の場合は100%とする
    }

    // 期間内の実行記録をカウント
    const executedDays = this.countExecutedDaysInPeriod(records, startDate, endDate);
    
    return Math.min((executedDays / targetDays) * 100, 100);
  }

  /**
   * 今日の実行状況を確認
   */
  isTodayCompleted(records: HabitRecord[], targetDate?: Date): boolean {
    const today = targetDate || new Date();
    return records.some(record => record.isExecutedOnDate(today));
  }

  /**
   * 最後の実行日を取得
   */
  getLastExecutedDate(records: HabitRecord[]): Date | null {
    if (records.length === 0) {
      return null;
    }

    const sortedRecords = records
      .slice()
      .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime());

    return sortedRecords[0].executedAt;
  }

  /**
   * 総実行回数を取得
   */
  getTotalExecutions(records: HabitRecord[]): number {
    return records.length;
  }

  /**
   * 週間の実行パターンを分析
   * 曜日ごとの実行回数を返す (0: 日曜日, 1: 月曜日, ..., 6: 土曜日)
   */
  analyzeWeeklyPattern(records: HabitRecord[]): number[] {
    const weeklyPattern = new Array(7).fill(0);
    
    for (const record of records) {
      const dayOfWeek = record.executedAt.getDay();
      weeklyPattern[dayOfWeek]++;
    }

    return weeklyPattern;
  }

  /**
   * 指定期間内の目標実行日数を計算
   */
  private calculateTargetDays(
    frequency: TargetFrequency,
    startDate: Date,
    endDate: Date
  ): number {
    const totalDays = this.getDaysBetween(startDate, endDate) + 1;
    
    if (frequency.isDaily()) {
      return totalDays;
    } else if (frequency.isWeekly()) {
      return Math.floor(totalDays / 7);
    } else if (frequency.isMonthly()) {
      return Math.floor(totalDays / 30); // 概算
    }

    return totalDays; // デフォルトは毎日
  }

  /**
   * 指定期間内の実行日数をカウント
   */
  private countExecutedDaysInPeriod(
    records: HabitRecord[],
    startDate: Date,
    endDate: Date
  ): number {
    const executedDates = new Set<string>();
    
    for (const record of records) {
      const recordDate = record.executedAt;
      
      if (recordDate >= startDate && recordDate <= endDate) {
        const dateKey = this.formatDateKey(recordDate);
        executedDates.add(dateKey);
      }
    }

    return executedDates.size;
  }

  /**
   * 2つの日付が同じ日かどうかを判定
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * 日付の時間部分をリセット（午前0時にする）
   */
  private resetTimeToStartOfDay(date: Date): void {
    date.setHours(0, 0, 0, 0);
  }

  /**
   * 頻度に応じて日付から期間を減算
   */
  private subtractPeriod(date: Date, frequency: TargetFrequency): void {
    if (frequency.isDaily()) {
      date.setDate(date.getDate() - 1);
    } else if (frequency.isWeekly()) {
      date.setDate(date.getDate() - 7);
    } else if (frequency.isMonthly()) {
      date.setMonth(date.getMonth() - 1);
    }
  }

  /**
   * 2つの日付間の日数を取得
   */
  private getDaysBetween(startDate: Date, endDate: Date): number {
    const oneDay = 24 * 60 * 60 * 1000; // 1日のミリ秒
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    this.resetTimeToStartOfDay(start);
    this.resetTimeToStartOfDay(end);
    
    return Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay));
  }

  /**
   * 日付をキー文字列に変換（YYYY-MM-DD形式）
   */
  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}