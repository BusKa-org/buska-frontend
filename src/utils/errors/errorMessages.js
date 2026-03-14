/**
 * User-friendly error messages in Portuguese
 * Maps error codes to localized messages
 */

import { ErrorCode, ErrorCategory } from './errorTypes';

/**
 * Error messages by code
 */
export const errorMessages = {
  // Network
  [ErrorCode.NETWORK_ERROR]: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
  [ErrorCode.TIMEOUT]: 'A requisição demorou muito. Tente novamente.',
  [ErrorCode.NO_INTERNET]: 'Sem conexão com a internet. Verifique sua rede.',
  
  // Auth
  [ErrorCode.INVALID_CREDENTIALS]: 'E-mail ou senha incorretos.',
  [ErrorCode.TOKEN_EXPIRED]: 'Sua sessão expirou. Faça login novamente.',
  [ErrorCode.TOKEN_INVALID]: 'Sessão inválida. Faça login novamente.',
  [ErrorCode.SESSION_EXPIRED]: 'Sua sessão expirou. Faça login novamente.',
  [ErrorCode.UNAUTHORIZED]: 'Você precisa estar logado para acessar.',
  [ErrorCode.FORBIDDEN]: 'Você não tem permissão para esta ação.',
  
  // Validation
  [ErrorCode.VALIDATION_ERROR]: 'Dados inválidos. Verifique as informações.',
  [ErrorCode.INVALID_EMAIL]: 'E-mail inválido. Verifique o formato.',
  [ErrorCode.INVALID_CPF]: 'CPF inválido. Verifique os dígitos.',
  [ErrorCode.INVALID_PASSWORD]: 'Senha inválida.',
  [ErrorCode.PASSWORD_TOO_WEAK]: 'Senha muito fraca. Use letras, números e caracteres especiais.',
  [ErrorCode.REQUIRED_FIELD]: 'Este campo é obrigatório.',
  [ErrorCode.INVALID_FORMAT]: 'Formato inválido.',
  
  // Resource
  [ErrorCode.NOT_FOUND]: 'Recurso não encontrado.',
  [ErrorCode.USER_NOT_FOUND]: 'Usuário não encontrado.',
  [ErrorCode.ROUTE_NOT_FOUND]: 'Rota não encontrada.',
  [ErrorCode.TRIP_NOT_FOUND]: 'Viagem não encontrada.',
  
  // Conflict
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 'Este e-mail já está cadastrado.',
  [ErrorCode.CPF_ALREADY_EXISTS]: 'Este CPF já está cadastrado.',
  [ErrorCode.ALREADY_SUBSCRIBED]: 'Você já está inscrito nesta rota.',
  [ErrorCode.DUPLICATE_ENTRY]: 'Este registro já existe.',
  
  // Business Logic
  [ErrorCode.TRIP_ALREADY_STARTED]: 'Esta viagem já foi iniciada.',
  [ErrorCode.TRIP_ALREADY_FINISHED]: 'Esta viagem já foi finalizada.',
  [ErrorCode.CANNOT_SUBSCRIBE]: 'Não é possível se inscrever nesta rota.',
  [ErrorCode.LIMIT_EXCEEDED]: 'Limite excedido.',
  
  // Server
  [ErrorCode.INTERNAL_ERROR]: 'Erro interno. Tente novamente mais tarde.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Serviço temporariamente indisponível.',
  [ErrorCode.DATABASE_ERROR]: 'Erro ao acessar dados. Tente novamente.',
  
  // Unknown
  [ErrorCode.UNKNOWN_ERROR]: 'Ocorreu um erro inesperado. Tente novamente.',
};

/**
 * Category-based fallback messages
 */
export const categoryMessages = {
  [ErrorCategory.NETWORK]: 'Erro de conexão. Verifique sua internet.',
  [ErrorCategory.AUTHENTICATION]: 'Erro de autenticação. Faça login novamente.',
  [ErrorCategory.AUTHORIZATION]: 'Você não tem permissão para esta ação.',
  [ErrorCategory.VALIDATION]: 'Dados inválidos. Verifique as informações.',
  [ErrorCategory.NOT_FOUND]: 'O item solicitado não foi encontrado.',
  [ErrorCategory.CONFLICT]: 'Conflito de dados. O registro já existe.',
  [ErrorCategory.SERVER]: 'Erro no servidor. Tente novamente mais tarde.',
  [ErrorCategory.CLIENT]: 'Erro na aplicação. Tente novamente.',
  [ErrorCategory.UNKNOWN]: 'Ocorreu um erro inesperado.',
};

/**
 * HTTP status code messages
 */
export const httpStatusMessages = {
  400: 'Requisição inválida. Verifique os dados enviados.',
  401: 'Não autorizado. Faça login para continuar.',
  403: 'Acesso negado. Você não tem permissão.',
  404: 'Não encontrado.',
  408: 'Tempo esgotado. Tente novamente.',
  409: 'Conflito. Este registro já existe.',
  422: 'Dados inválidos. Verifique as informações.',
  429: 'Muitas tentativas. Aguarde um momento.',
  500: 'Erro interno do servidor.',
  502: 'Servidor indisponível. Tente novamente.',
  503: 'Serviço temporariamente indisponível.',
  504: 'Tempo de resposta esgotado.',
};

/**
 * Get user-friendly message for an error code
 */
export function getErrorMessage(code) {
  return errorMessages[code] || errorMessages[ErrorCode.UNKNOWN_ERROR];
}

/**
 * Get message by category
 */
export function getCategoryMessage(category) {
  return categoryMessages[category] || categoryMessages[ErrorCategory.UNKNOWN];
}

/**
 * Get message by HTTP status
 */
export function getHttpStatusMessage(status) {
  return httpStatusMessages[status] || `Erro ${status}. Tente novamente.`;
}

/**
 * Field-specific validation messages
 */
export const fieldValidationMessages = {
  nome: {
    required: 'Nome é obrigatório.',
    minLength: 'Nome deve ter pelo menos 3 caracteres.',
    maxLength: 'Nome deve ter no máximo 100 caracteres.',
  },
  email: {
    required: 'E-mail é obrigatório.',
    invalid: 'E-mail inválido. Verifique o formato.',
    exists: 'Este e-mail já está cadastrado.',
  },
  password: {
    required: 'Senha é obrigatória.',
    minLength: 'Senha deve ter pelo menos 8 caracteres.',
    weak: 'Senha muito fraca. Use letras e números.',
    mismatch: 'As senhas não coincidem.',
  },
  cpf: {
    required: 'CPF é obrigatório.',
    invalid: 'CPF inválido. Verifique os dígitos.',
    exists: 'Este CPF já está cadastrado.',
  },
  matricula: {
    required: 'Matrícula é obrigatória.',
    invalid: 'Matrícula inválida.',
  },
  telefone: {
    invalid: 'Telefone inválido. Use o formato (00) 00000-0000.',
  },
};

/**
 * Get field validation message
 */
export function getFieldValidationMessage(field, type = 'required') {
  const fieldMessages = fieldValidationMessages[field];
  if (fieldMessages && fieldMessages[type]) {
    return fieldMessages[type];
  }
  return `Campo ${field} inválido.`;
}
