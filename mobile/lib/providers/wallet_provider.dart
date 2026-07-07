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

  // Separate from `transactions` (the last-20 summary shown on Home) so the
  // full history screen can paginate independently without disturbing it.
  List<WalletTransaction> history = [];
  bool isLoadingHistory = false;
  bool hasMoreHistory = true;
  String? historyCategory;
  int _historyPage = 1;
  static const _historyPageSize = 20;

  Future<({String accountNumber, String bankName})?> getVirtualAccount() async {
    try {
      final account = await _service.getVirtualAccount();
      errorMessage = null;
      return account;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return null;
    }
  }

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

  // [category] filters ('wallet_funding', 'withdrawal', 'refund',
  // 'service_payment') or null for everything; changing it restarts paging.
  Future<void> loadHistory({String? category}) async {
    historyCategory = category;
    _historyPage = 1;
    history = [];
    hasMoreHistory = true;
    await loadMoreHistory();
  }

  Future<void> loadMoreHistory() async {
    if (isLoadingHistory || !hasMoreHistory) return;
    isLoadingHistory = true;
    notifyListeners();
    try {
      final page = await _service.getTransactions(
        page: _historyPage,
        limit: _historyPageSize,
        category: historyCategory,
      );
      history = [...history, ...page];
      hasMoreHistory = page.length == _historyPageSize;
      _historyPage++;
      errorMessage = null;
    } on ApiException catch (e) {
      errorMessage = e.message;
    } finally {
      isLoadingHistory = false;
      notifyListeners();
    }
  }

  Future<Map<String, String>?> fund(
    int amountKobo, {
    required String method,
    required String platform,
  }) async {
    try {
      return await _service.fund(
        amountKobo: amountKobo,
        method: method,
        platform: platform,
      );
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return null;
    }
  }

  // Checks Nomba directly instead of just waiting on their webhook, then
  // refreshes local state so the balance reflects it right away if settled.
  Future<String> verifyFunding(String orderReference) async {
    try {
      final status = await _service.verifyFunding(orderReference);
      await refresh();
      return status;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return 'pending';
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

}
