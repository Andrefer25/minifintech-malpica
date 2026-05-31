import { DomainError } from '../shared/domain-error';

export class TransactionNotFoundError extends DomainError {
  public readonly httpStatus = 404;
  constructor(_id?: string) {
    super('Transacción no encontrada');
  }
}

export class TransactionNotPendingError extends DomainError {
  public readonly httpStatus = 400;
  constructor() {
    super('La transacción no está pendiente');
  }
}

export class TransactionApproveStateError extends DomainError {
  public readonly httpStatus = 400;
  constructor() {
    super('Solo las transacciones pendientes pueden ser aprobadas');
  }
}

export class TransactionCompleteStateError extends DomainError {
  public readonly httpStatus = 400;
  constructor() {
    super('Solo las transacciones aprobadas pueden completarse');
  }
}

export class TransactionRejectStateError extends DomainError {
  public readonly httpStatus = 400;
  constructor() {
    super('Solo las transacciones pendientes pueden ser rechazadas');
  }
}

export class InvalidTransactionAmountError extends DomainError {
  public readonly httpStatus = 400;
  constructor() {
    super('El monto debe ser mayor a cero');
  }
}

export class TransactionSameUserError extends DomainError {
  public readonly httpStatus = 400;
  constructor() {
    super('El usuario origen y destino no pueden ser el mismo');
  }
}

export class InvalidDateRangeError extends DomainError {
  public readonly httpStatus = 400;
  constructor() {
    super('La fecha de inicio debe ser menor o igual a la fecha de fin');
  }
}

export class InvalidAmountRangeError extends DomainError {
  public readonly httpStatus = 400;
  constructor() {
    super('El monto mínimo debe ser menor o igual al monto máximo');
  }
}
