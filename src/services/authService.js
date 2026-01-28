import api from './api';
import { Storage, STORAGE_KEYS } from '../utils/storage';

// Simple validation error class (inline to avoid circular deps)
class SimpleValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = 'VALIDATION_ERROR';
    this.category = 'VALIDATION';
  }
}

export const authService = {
  /**
   * Login user
   * Backend: POST /v1/auth/login
   * Returns: { access_token, token_type }
   */
  async login(email, password) {
    // Client-side validation
    if (!email?.trim()) {
      throw new SimpleValidationError('E-mail é obrigatório', 'email');
    }
    if (!password) {
      throw new SimpleValidationError('Senha é obrigatória', 'password');
    }

    const response = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    const { access_token } = response.data;

    // Store token
    await Storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);

    // Fetch user profile after login
    const userResponse = await api.get('/users/me');
    const user = userResponse.data;

    // Store user info
    await Storage.setItem(STORAGE_KEYS.USER, user);

    return { access_token, user };
  },

  /**
   * Register new student (public endpoint)
   * Backend: POST /v1/alunos/signup
   */
  async register(userData) {
    // Client-side validation
    if (!userData.nome?.trim()) {
      throw new SimpleValidationError('Nome é obrigatório', 'nome');
    }
    if (!userData.email?.trim()) {
      throw new SimpleValidationError('E-mail é obrigatório', 'email');
    }
    if (!userData.password || userData.password.length < 6) {
      throw new SimpleValidationError('Senha deve ter pelo menos 6 caracteres', 'password');
    }
    if (!userData.cpf || userData.cpf.replace(/\D/g, '').length !== 11) {
      throw new SimpleValidationError('CPF inválido. Informe os 11 dígitos', 'cpf');
    }
    if (!userData.matricula?.trim()) {
      throw new SimpleValidationError('Matrícula é obrigatória', 'matricula');
    }

    const response = await api.post('/alunos/signup', {
      nome: userData.nome.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      cpf: userData.cpf.replace(/\D/g, ''),
      matricula: userData.matricula.trim(),
      instituicao_id: userData.instituicao_id,
      telefone: userData.telefone?.replace(/\D/g, '') || undefined,
      endereco_casa: userData.endereco_casa,
    });

    return response.data;
  },

  /**
   * Logout user
   */
  async logout() {
    console.log('authService: Logging out...');
    await Storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await Storage.removeItem(STORAGE_KEYS.USER);
    console.log('authService: Logged out');
  },

  /**
   * Get current user from storage
   */
  async getCurrentUser() {
    return await Storage.getItem(STORAGE_KEYS.USER);
  },

  /**
   * Refresh user data from server
   */
  async refreshUserData() {
    const response = await api.get('/users/me');
    const user = response.data;
    await Storage.setItem(STORAGE_KEYS.USER, user);
    return user;
  },

  /**
   * Update stored user data
   */
  async updateStoredUser(userData) {
    await Storage.setItem(STORAGE_KEYS.USER, userData);
  },

  /**
   * Get stored access token
   */
  async getAccessToken() {
    return await Storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    const token = await Storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  },

  /**
   * Change password
   * Backend: POST /v1/users/change-password
   */
  async changePassword(currentPassword, newPassword) {
    if (!currentPassword) {
      throw new SimpleValidationError('Senha atual é obrigatória', 'current_password');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new SimpleValidationError('Nova senha deve ter pelo menos 6 caracteres', 'new_password');
    }

    const response = await api.post('/users/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    
    return response.data;
  },
};
