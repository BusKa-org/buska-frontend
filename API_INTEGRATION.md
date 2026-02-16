# API Integration Guide

This document explains how the frontend is integrated with the backend API.

## Overview

The frontend uses axios for HTTP requests and integrates with the Flask backend API. All API calls are centralized in service files located in `src/services/`.

## Configuration

### API Base URL

The API base URL is configured in `src/config/api.js`. By default:
- **Development**: `http://localhost:5000`
- **Production**: Update `PRODUCTION` value in the config file

### CORS Configuration

Make sure your Flask backend has CORS enabled. Add this to your Flask app initialization:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
# Or configure specific origins:
# CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
```

## Services

### Authentication (`authService.js`)
- `login(email, password)` - User login
- `register(userData)` - User registration
- `logout()` - User logout
- `getCurrentUser()` - Get stored user info
- `isAuthenticated()` - Check auth status

### Aluno Service (`alunoService.js`)
- `listarRotas()` - List available routes
- `listarMinhasRotas()` - List enrolled routes
- `gerenciarInscricaoRota(rotaId, acao)` - Subscribe/unsubscribe from route
- `listarViagens()` - List available trips
- `listarMinhasViagens()` - List registered trips
- `alterarPresencaViagem(viagemId, presente)` - Confirm/cancel presence

### Motorista Service (`motoristaService.js`)
- `listarRotas()` - List assigned routes
- `criarRota(nome)` - Create new route
- `adicionarPontos(rotaId, municipioId, pontos)` - Add points to route
- `listarViagens()` - List trips
- `iniciarViagem(viagemId)` - Start trip
- `finalizarViagem(viagemId)` - Finish trip

### Gestor Service (`gestorService.js`)
- `listarRotas()` - List routes in municipality
- `listarViagens()` - List trips in municipality
- `criarViagem(viagemData)` - Create new trip
- `listarMotoristas()` - List drivers
- `criarMotorista(motoristaData)` - Create new driver
- `relatoriosRotas()` - Get route reports

### User Service (`userService.js`)
- `getCurrentUser()` - Get user profile
- `updateUser(userData)` - Update user profile
- `listUsers()` - List all users (gestor only)

## Authentication Flow

1. User logs in via `Login` screen
2. `authService.login()` is called
3. JWT token is stored in AsyncStorage (mobile) or localStorage (web)
4. Token is automatically added to all subsequent API requests via axios interceptor
5. `AuthContext` manages authentication state
6. `MainNavigator` routes users based on authentication status and role

## Usage Example

```javascript
import { alunoService } from '../services';
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  const [rotas, setRotas] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'aluno') {
      alunoService.listarRotas()
        .then(data => setRotas(data))
        .catch(error => console.error(error));
    }
  }, [isAuthenticated, user]);

  return (
    // Your component JSX
  );
}
```

## Error Handling

All services include error handling that returns consistent error objects:
```javascript
{
  message: "Error message",
  status: 400, // HTTP status code
  data: {} // Additional error data
}
```

## Token Management

- Tokens are stored securely using AsyncStorage (mobile) or localStorage (web)
- Tokens are automatically added to request headers via axios interceptor
- On 401 errors, tokens are cleared and user is logged out

## Testing

1. Start your Flask backend: `cd buska-backend && make run`
2. Start the frontend: `cd buska-frontend && npm run web`
3. The frontend will connect to `http://localhost:5000` by default

## Troubleshooting

### CORS Errors
- Ensure Flask-CORS is installed and configured
- Check that the API base URL matches your backend URL
- For mobile (Android), you may need to use `10.0.2.2` instead of `localhost` for Android emulator

### Network Errors
- Verify backend is running
- Check API base URL configuration
- For mobile, ensure device/emulator can reach the backend IP address

### Authentication Issues
- Check that tokens are being stored correctly
- Verify JWT token format matches backend expectations
- Check token expiration settings
