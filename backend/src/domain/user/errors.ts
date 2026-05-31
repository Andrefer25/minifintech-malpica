import { DomainError } from '../shared/domain-error';

export class InsufficientBalanceError extends DomainError {
  public readonly httpStatus = 400;
  constructor() {
    super('Saldo insuficiente');
  }
}

/**
 * Saldo insuficiente detectado al aprobar una transacción pendiente.
 * Distinto status code (409) según endpoints.md §7.
 */
export class InsufficientBalanceOnApproveError extends DomainError {
  public readonly httpStatus = 409;
  constructor() {
    super('Saldo insuficiente');
  }
}

export class InvalidAmountError extends DomainError {
  public readonly httpStatus = 400;
  constructor(message: string = 'El monto debe ser mayor a cero') {
    super(message);
  }
}

export class UserNotFoundError extends DomainError {
  public readonly httpStatus = 404;
  constructor(_id?: string) {
    super('Usuario no encontrado');
  }
}

export class SameUserError extends DomainError {
  public readonly httpStatus = 400;
  constructor() {
    super('El usuario origen y destino no pueden ser el mismo');
  }
}
