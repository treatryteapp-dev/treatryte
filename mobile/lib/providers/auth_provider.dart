import 'package:flutter/foundation.dart';

import '../models/user.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthProvider extends ChangeNotifier {
  AuthProvider(this._authService);

  final AuthService _authService;

  AuthStatus status = AuthStatus.unknown;
  AppUser? currentUser;
  String? errorMessage;
  bool isLoading = false;

  bool get isAuthenticated => status == AuthStatus.authenticated;

  Future<void> checkSession() async {
    final user = await _authService.fetchCurrentUser();
    currentUser = user;
    status = user != null ? AuthStatus.authenticated : AuthStatus.unauthenticated;
    notifyListeners();
  }

  Future<bool> register({
    required String fullName,
    required String dateOfBirth,
    required String gender,
    required String address,
    required String email,
    required String password,
    String? role,
  }) =>
      _runAuthAction(() => _authService.register(
            fullName: fullName,
            dateOfBirth: dateOfBirth,
            gender: gender,
            address: address,
            email: email,
            password: password,
            role: role,
          ));

  Future<bool> login({required String email, required String password}) =>
      _runAuthAction(() => _authService.login(email: email, password: password));

  Future<bool> _runAuthAction(Future<AuthResult> Function() action) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      final result = await action();
      currentUser = result.user;
      status = AuthStatus.authenticated;
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    currentUser = null;
    status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
