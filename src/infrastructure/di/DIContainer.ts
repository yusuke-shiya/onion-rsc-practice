import { PrismaClient } from '../../../generated/prisma';
import { HabitRepository } from '../../domain/repositories/HabitRepository';
import { HabitRecordRepository } from '../../domain/repositories/HabitRecordRepository';
import { HabitProgressService } from '../../domain/services/HabitProgressService';
import { PrismaHabitRepository } from '../repositories/PrismaHabitRepository';
import { PrismaHabitRecordRepository } from '../repositories/PrismaHabitRecordRepository';

/**
 * 依存性注入コンテナ
 * Singleton パターンを使用してアプリケーション全体で単一のインスタンスを管理
 * Onion Architecture の依存性逆転の原則に従い、インフラ層が外側からドメイン層に依存を注入
 */
export class DIContainer {
  private static instance: DIContainer | null = null;
  
  private readonly _prismaClient: PrismaClient;
  private readonly _habitRepository: HabitRepository;
  private readonly _habitRecordRepository: HabitRecordRepository;
  private readonly _habitProgressService: HabitProgressService;

  /**
   * プライベートコンストラクタ（Singletonパターン）
   */
  private constructor() {
    // PrismaClientの初期化
    this._prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });

    // Repositoryの初期化
    this._habitRepository = new PrismaHabitRepository(this._prismaClient);
    this._habitRecordRepository = new PrismaHabitRecordRepository(this._prismaClient);

    // Domain Serviceの初期化
    this._habitProgressService = new HabitProgressService();
  }

  /**
   * シングルトンインスタンスの取得
   */
  static getInstance(): DIContainer {
    if (DIContainer.instance === null) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * PrismaClientの取得
   */
  get prismaClient(): PrismaClient {
    return this._prismaClient;
  }

  /**
   * HabitRepositoryの取得
   */
  get habitRepository(): HabitRepository {
    return this._habitRepository;
  }

  /**
   * HabitRecordRepositoryの取得
   */
  get habitRecordRepository(): HabitRecordRepository {
    return this._habitRecordRepository;
  }

  /**
   * HabitProgressServiceの取得
   */
  get habitProgressService(): HabitProgressService {
    return this._habitProgressService;
  }

  /**
   * データベース接続を閉じる
   * アプリケーション終了時に呼び出す
   */
  async disconnect(): Promise<void> {
    await this._prismaClient.$disconnect();
  }

  /**
   * データベース接続をテスト
   */
  async testConnection(): Promise<boolean> {
    try {
      await this._prismaClient.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * トランザクション実行のヘルパー
   */
  async executeTransaction<T>(
    callback: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => Promise<T>
  ): Promise<T> {
    return await this._prismaClient.$transaction(callback);
  }

  /**
   * テスト用のリセット機能（テスト環境でのみ使用）
   */
  static resetInstance(): void {
    if (process.env.NODE_ENV === 'test') {
      if (DIContainer.instance) {
        DIContainer.instance.disconnect();
      }
      DIContainer.instance = null;
    }
  }
}

/**
 * DIコンテナの便利なエクスポート
 */
export const container = DIContainer.getInstance();