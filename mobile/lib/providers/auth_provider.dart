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
    String? planId,
    String? facilityName,
    String? licenseNumber,
    List<String>? services,
    String? state,
    String? bankName,
    String? accountNumber,
  }) =>
      _runAuthAction(() => _authService.register(
            fullName: fullName,
            dateOfBirth: dateOfBirth,
            gender: gender,
            address: address,
            email: email,
            password: password,
            role: role,
            planId: planId,
            facilityName: facilityName,
            licenseNumber: licenseNumber,
            services: services,
            state: state,
            bankName: bankName,
            accountNumber: accountNumber,
          ));

  Future<bool> login({
    required String email,
    required String password,
    bool keepLoggedIn = true,
  }) =>
      _runAuthAction(
        () => _authService.login(
          email: email,
          password: password,
          keepLoggedIn: keepLoggedIn,
        ),
      );

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

  Future<bool> updateAvatar({
    required String fileName,
    required String mimeType,
    required List<int> bytes,
  }) async {
    try {
      currentUser = await _authService.updateAvatar(fileName: fileName, mimeType: mimeType, bytes: bytes);
      errorMessage = null;
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      return false;
    } finally {
      notifyListeners();
    }
  }

  Future<bool> deleteAccount(String password) async {
    try {
      await _authService.deleteAccount(password);
      currentUser = null;
      status = AuthStatus.unauthenticated;
      errorMessage = null;
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      return false;
    } finally {
      notifyListeners();
    }
  }
}
