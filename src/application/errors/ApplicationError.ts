/**
 * アプリケーション層のエラー定義
 * ビジネスロジックエラーと技術的エラーを区別する
 */

export abstract class ApplicationError extends Error {
  abstract readonly code: string;
  abstract readonly category: 'validation' | 'business' | 'technical' | 'permission';

  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  /**
   * エラーの詳細情報を含むオブジェクトを返す
   */
  toObject(): {
    code: string;
    category: string;
    message: string;
    details?: Record<string, unknown>;
  } {
    return {
      code: this.code,
      category: this.category,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends ApplicationError {
  readonly code = 'VALIDATION_ERROR';
  readonly category = 'validation' as const;

  constructor(
    message: string,
    public readonly fieldErrors?: Array<{ field: string; message: string }>
  ) {
    super(message, { fieldErrors });
  }
}

/**
 * ビジネスルールエラー
 */
export class BusinessRuleError extends ApplicationError {
  readonly code = 'BUSINESS_RULE_ERROR';
  readonly category = 'business' as const;

  constructor(
    message: string,
    public readonly ruleCode: string,
    details?: Record<string, unknown>
  ) {
    super(message, { ruleCode, ...details });
  }
}

/**
 * リソースが見つからないエラー
 */
export class NotFoundError extends ApplicationError {
  readonly code = 'NOT_FOUND';
  readonly category = 'business' as const;

  constructor(
    resource: string,
    identifier: string | number,
    details?: Record<string, unknown>
  ) {
    super(`${resource} not found: ${identifier}`, { resource, identifier, ...details });
  }
}

/**
 * 重複エラー
 */
export class ConflictError extends ApplicationError {
  readonly code = 'CONFLICT';
  readonly category = 'business' as const;

  constructor(
    resource: string,
    conflictingField: string,
    value: unknown,
    details?: Record<string, unknown>
  ) {
    super(`${resource} already exists with ${conflictingField}: ${value}`, {
      resource,
      conflictingField,
      value,
      ...details,
    });
  }
}

/**
 * 権限エラー
 */
export class PermissionError extends ApplicationError {
  readonly code = 'PERMISSION_DENIED';
  readonly category = 'permission' as const;

  constructor(
    action: string,
    resource?: string,
    details?: Record<string, unknown>
  ) {
    const message = resource 
      ? `Permission denied for action '${action}' on resource '${resource}'`
      : `Permission denied for action '${action}'`;
    
    super(message, { action, resource, ...details });
  }
}

/**
 * 技術的エラー（インフラ層からのエラーをラップ）
 */
export class TechnicalError extends ApplicationError {
  readonly code = 'TECHNICAL_ERROR';
  readonly category = 'technical' as const;

  constructor(
    message: string,
    public readonly originalError?: Error,
    details?: Record<string, unknown>
  ) {
    super(message, { originalError: originalError?.message, ...details });
  }
}

/**
 * Use Case実行時の一般的なエラー
 */
export class UseCaseError extends ApplicationError {
  readonly category = 'business' as const;

  constructor(
    public readonly code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message, details);
  }
}

/**
 * エラーからApplicationErrorを作成するファクトリ関数
 */
export class ApplicationErrorFactory {
  /**
   * 一般的なErrorからApplicationErrorを作成
   */
  static fromError(error: Error): ApplicationError {
    if (error instanceof ApplicationError) {
      return error;
    }

    return new TechnicalError(
      error.message || 'An unexpected error occurred',
      error
    );
  }

  /**
   * ドメインエラーからApplicationErrorを作成
   */
  static fromDomainError(error: Error): ApplicationError {
    if (error.message.includes('validation')) {
      return new ValidationError(error.message);
    }
    
    if (error.message.includes('business rule')) {
      return new BusinessRuleError(error.message, 'DOMAIN_RULE_VIOLATION');
    }

    return new TechnicalError('Domain operation failed', error);
  }

  /**
   * Zodバリデーションエラーからバリデーションエラーを作成
   */
  static fromZodError(zodError: { issues: Array<{ path: (string | number)[]; message: string }> }): ValidationError {
    const fieldErrors = zodError.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return new ValidationError('Input validation failed', fieldErrors);
  }
}