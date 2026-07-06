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
    String? planId,
    String? facilityName,
    String? licenseNumber,
    List<String>? services,
    String? state,
    String? bankName,
    String? accountNumber,
  }) async {
    final result = await _api.post('/auth/register', _parseAuthResponse, body: {
      'fullName': fullName,
      'dateOfBirth': dateOfBirth,
      'gender': gender,
      'address': address,
      'email': email,
      'password': password,
      if (role != null) 'role': role,
      if (planId != null) 'planId': planId,
      if (facilityName != null) 'facilityName': facilityName,
      if (licenseNumber != null) 'licenseNumber': licenseNumber,
      if (services != null) 'services': services,
      if (state != null) 'state': state,
      if (bankName != null) 'bankName': bankName,
      if (accountNumber != null) 'accountNumber': accountNumber,
    });
    await _storage.saveTokens(accessToken: result.accessToken, refreshToken: result.refreshToken);
    return AuthResult(result.user);
  }

  Future<AuthResult> login({
    required String email,
    required String password,
    bool keepLoggedIn = true,
  }) async {
    final result = await _api.post(
      '/auth/login',
      _parseAuthResponse,
      body: {'email': email, 'password': password},
    );
    await _storage.saveTokens(accessToken: result.accessToken, refreshToken: result.refreshToken);
    // Persist the user's session preference so checkSession() knows whether to
    // restore the session on a future cold start.
    await _storage.saveKeepLoggedIn(keepLoggedIn);
    return AuthResult(result.user);
  }

  /// Returns the current user if a valid (or refreshable) session exists.
  ///
  /// Behaviour:
  /// - If [keepLoggedIn] is false (session-only), tokens are wiped on a cold
  ///   start before we even try the network, logging the user out immediately.
  /// - If the access token has expired (401), we attempt a silent refresh
  ///   using the stored refresh token before giving up, so the user stays
  ///   logged in for up to 30 days without re-entering their credentials.
  Future<AppUser?> fetchCurrentUser() async {
    final keep = await _storage.keepLoggedIn;
    if (!keep) {
      // Session-only preference: clear tokens so the user is prompted to log
      // in again on the next cold start (e.g. after app is fully killed).
      await _storage.clear();
      return null;
    }

    final token = await _storage.accessToken;
    if (token == null) return null;

    try {
      return await _api.get('/auth/me', (data) => AppUser.fromJson(data['user']));
    } on ApiException catch (e) {
      // 401 means the access token has expired. Try a silent refresh once.
      if (e.statusCode == 401) {
        try {
          final refreshToken = await _storage.refreshToken;
          if (refreshToken == null) return null;

          final refreshed = await _api.post(
            '/auth/refresh',
            _parseAuthResponse,
            body: {'refreshToken': refreshToken},
          );
          await _storage.saveTokens(
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
          );
          return refreshed.user;
        } on ApiException {
          // Refresh also failed — session is fully expired. Clear credentials.
          await _storage.clear();
          return null;
        }
      }
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

  /// Same presign -> direct S3 PUT -> confirm flow the Vault uses, just
  /// against a dedicated `avatars/{userId}/...` key so a user can only ever
  /// overwrite their own avatar.
  Future<AppUser> updateAvatar({
    required String fileName,
    required String mimeType,
    required List<int> bytes,
  }) async {
    final presign = await _api.post(
      '/auth/me/avatar/presign',
      (data) => {'uploadUrl': data['uploadUrl'] as String, 's3Key': data['s3Key'] as String},
      body: {'fileName': fileName, 'mimeType': mimeType},
    );

    await _api.putRaw(presign['uploadUrl']!, bytes, contentType: mimeType);

    return _api.post(
      '/auth/me/avatar/confirm',
      (data) => AppUser.fromJson(data['user']),
      body: {'s3Key': presign['s3Key']},
    );
  }

  Future<void> deleteAccount(String password) async {
    await _api.delete('/auth/me', (_) => null, body: {'password': password});
    await _storage.clear();
  }
}

