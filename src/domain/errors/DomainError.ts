/**
 * ドメインエラーの基底クラス
 * ビジネスルール違反やドメイン層でのバリデーションエラーを表現
 */
export class DomainError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'DomainError';
    this.cause = cause;
    
    // TypeScriptでのprototypeチェーン維持
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

/**
 * Value Objectでのバリデーションエラー
 */
export class ValueObjectValidationError extends DomainError {
  constructor(valueName: string, value: unknown, message: string) {
    super(`${valueName}: ${message} (received: ${value})`);
    this.name = 'ValueObjectValidationError';
    
    Object.setPrototypeOf(this, ValueObjectValidationError.prototype);
  }
}

/**
 * ドメインエンティティでのビジネスルール違反
 */
export class BusinessRuleViolationError extends DomainError {
  constructor(rule: string, message: string) {
    super(`Business rule violation - ${rule}: ${message}`);
    this.name = 'BusinessRuleViolationError';
    
    Object.setPrototypeOf(this, BusinessRuleViolationError.prototype);
  }
}