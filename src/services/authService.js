import api from './api';
import { Storage, STORAGE_KEYS } from '../utils/storage';
import { ValidationError, errorLogger } from '../utils/errors';

export const authService = {
  /**
   * Login user
   * Backend: POST /v1/auth/login
   * Returns: { access_token, token_type }
   */
  async login(email, password) {
    // Client-side validation
    if (!email?.trim()) {
      throw new ValidationError('E-mail é obrigatório', 'email');
    }
    if (!password) {
      throw new ValidationError('Senha é obrigatória', 'password');
    }

    const response = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    const { access_token } = response.data;

    // Store token
    await Storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);

    // Fetch user profile after login (pass token directly to avoid timing issues)
    const userResponse = await api.get('/users/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const user = userResponse.data;

    // Store user info
    await Storage.setItem(STORAGE_KEYS.USER, user);

    errorLogger.info('User logged in successfully', { userId: user.id, role: user.role });

    return { access_token, user };
  },

  /**
   * Register new student (public endpoint)
   * Backend: POST /v1/alunos/signup
   */
  async register(userData) {
    // Client-side validation
    if (!userData.nome?.trim()) {
      throw new ValidationError('Nome é obrigatório', 'nome');
    }
    if (!userData.email?.trim()) {
      throw new ValidationError('E-mail é obrigatório', 'email');
    }
    if (!userData.password || userData.password.length < 6) {
      throw new ValidationError('Senha deve ter pelo menos 6 caracteres', 'password');
    }
    if (!userData.cpf || userData.cpf.replace(/\D/g, '').length !== 11) {
      throw new ValidationError('CPF inválido. Informe os 11 dígitos', 'cpf');
    }
    if (!userData.matricula?.trim()) {
      throw new ValidationError('Matrícula é obrigatória', 'matricula');
    }
    if (!userData.instituicao_id) {
      throw new ValidationError('Instituição é obrigatória', 'instituicao_id');
    }
    if (!userData.endereco_casa) {
      throw new ValidationError('Endereço é obrigatório', 'endereco_casa');
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

    errorLogger.info('User registered successfully', { email: userData.email });

    return response.data;
  },

  /**
   * Logout user
   */
  async logout() {
    errorLogger.info('User logging out...');
    await Storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await Storage.removeItem(STORAGE_KEYS.USER);
    errorLogger.info('User logged out successfully');
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
      throw new ValidationError('Senha atual é obrigatória', 'current_password');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new ValidationError('Nova senha deve ter pelo menos 6 caracteres', 'new_password');
    }

    const response = await api.post('/users/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    
    errorLogger.info('Password changed successfully');
    return response.data;
  },
};
