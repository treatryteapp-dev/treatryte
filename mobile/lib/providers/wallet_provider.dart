import 'package:flutter/foundation.dart';

import '../models/bank.dart';
import '../models/transaction.dart';
import '../services/api_client.dart';
import '../services/wallet_service.dart';

class WalletProvider extends ChangeNotifier {
  WalletProvider(this._service);

  final WalletService _service;

  int balanceKobo = 0;
  List<WalletTransaction> transactions = [];
  bool isLoading = false;
  String? errorMessage;

  String get formattedBalance {
    final naira = balanceKobo / 100;
    return '₦${naira.toStringAsFixed(2).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d)\.)'), (m) => '${m[1]},')}';
  }

  Future<void> refresh() async {
    isLoading = true;
    notifyListeners();
    try {
      balanceKobo = await _service.getBalanceKobo();
      transactions = await _service.getTransactions();
      errorMessage = null;
    } on ApiException catch (e) {
      errorMessage = e.message;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<String?> fund(int amountKobo, {required String method}) async {
    try {
      final result = await _service.fund(
        amountKobo: amountKobo,
        method: method,
      );
      return result['checkoutLink'];
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return null;
    }
  }

  Future<List<Bank>> getBanks() => _service.getBanks();

  Future<String?> lookupAccount({
    required String accountNumber,
    required String bankCode,
  }) async {
    try {
      return await _service.lookupAccount(
        accountNumber: accountNumber,
        bankCode: bankCode,
      );
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return null;
    }
  }

  Future<bool> withdraw({
    required int amountKobo,
    required String accountNumber,
    required String bankCode,
    required String accountName,
    String? narration,
  }) async {
    try {
      await _service.withdraw(
        amountKobo: amountKobo,
        accountNumber: accountNumber,
        bankCode: bankCode,
        accountName: accountName,
        narration: narration,
      );
      await refresh();
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<bool> payProvider({
    required int amountKobo,
    required String providerCode,
    String? narration,
  }) async {
    try {
      await _service.payProvider(
        amountKobo: amountKobo,
        providerCode: providerCode,
        narration: narration,
      );
      await refresh();
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }
}
