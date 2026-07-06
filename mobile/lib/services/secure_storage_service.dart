import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  SecureStorageService() : _storage = const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _keepLoggedInKey = 'keep_logged_in';

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
    await _storage.write(key: _refreshTokenKey, value: refreshToken);
  }

  Future<String?> get accessToken => _storage.read(key: _accessTokenKey);
  Future<String?> get refreshToken => _storage.read(key: _refreshTokenKey);

  /// Persists whether the user chose to stay logged in for 30 days.
  Future<void> saveKeepLoggedIn(bool value) =>
      _storage.write(key: _keepLoggedInKey, value: value ? 'true' : 'false');

  /// Returns true if the user previously chose "Keep me logged in".
  /// Defaults to true when no preference is stored (e.g. first install).
  Future<bool> get keepLoggedIn async {
    final raw = await _storage.read(key: _keepLoggedInKey);
    return raw != 'false'; // anything other than explicit 'false' => keep
  }

  Future<void> clear() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
    // Intentionally preserve _keepLoggedInKey so the next login defaults
    // to whatever the user last chose.
  }
}
