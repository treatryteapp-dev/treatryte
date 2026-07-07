import '../models/bank.dart';
import '../models/transaction.dart';
import 'api_client.dart';

class WalletService {
  WalletService(this._api);

  final ApiClient _api;

  Future<int> getBalanceKobo() =>
      _api.get('/wallet', (data) => data['balanceKobo'] as int);

  Future<List<WalletTransaction>> getTransactions({
    int page = 1,
    int limit = 20,
    String? category,
  }) => _api.get(
    '/wallet/transactions',
    (data) => (data['transactions'] as List<dynamic>)
        .map((t) => WalletTransaction.fromJson(t as Map<String, dynamic>))
        .toList(),
    query: {
      'page': page,
      'limit': limit,
      if (category != null) 'category': category,
    },
  );

  // Checks Nomba directly for this order's real status and settles it if
  // Nomba has already confirmed success/failure - the on-demand counterpart
  // to waiting for their webhook to arrive. Returns 'success' | 'failed' |
  // 'pending'.
  Future<String> verifyFunding(String orderReference) => _api.post(
    '/wallet/fund/verify',
    (data) => data['status'] as String,
    body: {'orderReference': orderReference},
  );

  Future<Map<String, String>> fund({
    required int amountKobo,
    required String method,
    required String platform,
  }) => _api.post(
    '/wallet/fund',
    (data) => {
      'checkoutLink': data['checkoutLink'] as String,
      'orderReference': data['orderReference'] as String,
    },
    body: {'amountKobo': amountKobo, 'method': method, 'platform': platform},
  );

  Future<List<Bank>> getBanks() => _api.get(
    '/wallet/banks',
    (data) => (data['banks'] as List<dynamic>)
        .map((b) => Bank.fromJson(b as Map<String, dynamic>))
        .toList(),
  );

  Future<String> lookupAccount({
    required String accountNumber,
    required String bankCode,
  }) => _api.post(
    '/wallet/lookup-account',
    (data) => data['accountName'] as String,
    body: {'accountNumber': accountNumber, 'bankCode': bankCode},
  );

  Future<void> withdraw({
    required int amountKobo,
    required String accountNumber,
    required String bankCode,
    required String accountName,
    String? narration,
  }) => _api.post(
    '/wallet/withdraw',
    (_) => null,
    body: {
      'amountKobo': amountKobo,
      'accountNumber': accountNumber,
      'bankCode': bankCode,
      'accountName': accountName,
      if (narration != null) 'narration': narration,
    },
  );

}
