import '../models/user.dart';
import 'api_client.dart';
import 'secure_storage_service.dart';

class AuthResult {
  const AuthResult(this.user);
  final AppUser user;
}

class _RawAuthResponse {
  const _RawAuthResponse(this.user, this.accessToken, this.refreshToken);
  final AppUser user;
  final String accessToken;
  final String refreshToken;
}

_RawAuthResponse _parseAuthResponse(dynamic data) => _RawAuthResponse(
      AppUser.fromJson(data['user']),
      data['accessToken'] as String,
      data['refreshToken'] as String,
    );

class AuthService {
  AuthService(this._api, this._storage);

  final ApiClient _api;
  final SecureStorageService _storage;

  Future<AuthResult> register({
    required String fullName,
    required String dateOfBirth,
    required String gender,
    required String address,
    required String email,
    required String password,
    String? role,
  }) async {
    final result = await _api.post('/auth/register', _parseAuthResponse, body: {
      'fullName': fullName,
      'dateOfBirth': dateOfBirth,
      'gender': gender,
      'address': address,
      'email': email,
      'password': password,
      if (role != null) 'role': role,
    });
    await _storage.saveTokens(accessToken: result.accessToken, refreshToken: result.refreshToken);
    return AuthResult(result.user);
  }

  Future<AuthResult> login({required String email, required String password}) async {
    final result = await _api.post(
      '/auth/login',
      _parseAuthResponse,
      body: {'email': email, 'password': password},
    );
    await _storage.saveTokens(accessToken: result.accessToken, refreshToken: result.refreshToken);
    return AuthResult(result.user);
  }

  Future<AppUser?> fetchCurrentUser() async {
    final token = await _storage.accessToken;
    if (token == null) return null;
    try {
      return await _api.get('/auth/me', (data) => AppUser.fromJson(data['user']));
    } on ApiException {
      return null;
    }
  }

  Future<void> logout() async {
    final refreshToken = await _storage.refreshToken;
    await _storage.clear();
    if (refreshToken == null) return;
    try {
      await _api.post('/auth/logout', (_) => null, body: {'refreshToken': refreshToken});
    } on ApiException {
      // Already logged out locally - a failed remote revoke isn't fatal.
    }
  }
}
