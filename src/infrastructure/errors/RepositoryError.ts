/**
 * リポジトリ層で発生するエラーの基底クラス
 */
export abstract class RepositoryError extends Error {
  abstract readonly code: string;
  
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * データベース接続エラー
 */
export class DatabaseConnectionError extends RepositoryError {
  readonly code = 'DATABASE_CONNECTION_ERROR';
  
  constructor(message: string = 'Failed to connect to database', cause?: unknown) {
    super(message, cause);
  }
}

/**
 * レコードが見つからないエラー
 */
export class RecordNotFoundError extends RepositoryError {
  readonly code = 'RECORD_NOT_FOUND';
  
  constructor(
    public readonly entityType: string,
    public readonly identifier: string,
    cause?: unknown
  ) {
    super(`${entityType} with identifier '${identifier}' not found`, cause);
  }
}

/**
 * 制約違反エラー（一意制約、外部キー制約など）
 */
export class ConstraintViolationError extends RepositoryError {
  readonly code = 'CONSTRAINT_VIOLATION';
  
  constructor(
    public readonly constraintType: string,
    message: string,
    cause?: unknown
  ) {
    super(message, cause);
  }
}

/**
 * データベーストランザクションエラー
 */
export class TransactionError extends RepositoryError {
  readonly code = 'TRANSACTION_ERROR';
  
  constructor(message: string = 'Transaction failed', cause?: unknown) {
    super(message, cause);
  }
}

/**
 * データ整合性エラー
 */
export class DataIntegrityError extends RepositoryError {
  readonly code = 'DATA_INTEGRITY_ERROR';
  
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

/**
 * データベース操作タイムアウトエラー
 */
export class DatabaseTimeoutError extends RepositoryError {
  readonly code = 'DATABASE_TIMEOUT';
  
  constructor(message: string = 'Database operation timed out', cause?: unknown) {
    super(message, cause);
  }
}

/**
 * Prismaエラーを適切なRepositoryErrorに変換するヘルパー関数
 */
export function mapPrismaErrorToRepositoryError(error: unknown): RepositoryError {
  // PrismaClientKnownRequestError の場合
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const prismaError = error as { code: string; message: string; meta?: unknown };
    
    switch (prismaError.code) {
      case 'P2001': // Record not found
        return new RecordNotFoundError('Entity', 'unknown', error);
      
      case 'P2002': // Unique constraint violation
        return new ConstraintViolationError(
          'unique', 
          'Unique constraint violation',
          error
        );
      
      case 'P2003': // Foreign key constraint violation
        return new ConstraintViolationError(
          'foreign_key',
          'Foreign key constraint violation',
          error
        );
      
      case 'P2025': // Record to update not found
        return new RecordNotFoundError('Entity', 'unknown', error);
      
      case 'P1001': // Can't reach database server
      case 'P1002': // Database server timeout
        return new DatabaseConnectionError('Cannot reach database server', error);
      
      case 'P2024': // Timeout acquiring connection
        return new DatabaseTimeoutError('Timeout acquiring database connection', error);
      
      default:
        return new DataIntegrityError(prismaError.message, error);
    }
  }

  // PrismaClientInitializationError や PrismaClientRustPanicError の場合
  if (error instanceof Error) {
    if (error.name.includes('PrismaClientInitialization')) {
      return new DatabaseConnectionError(error.message, error);
    }
    if (error.name.includes('PrismaClientRustPanic')) {
      return new DataIntegrityError(error.message, error);
    }
  }

  // その他のエラー
  const message = error instanceof Error ? error.message : 'Unknown repository error';
  return new DataIntegrityError(message, error);
}