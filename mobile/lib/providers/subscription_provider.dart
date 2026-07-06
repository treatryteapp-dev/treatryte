import 'package:flutter/foundation.dart';

import '../models/subscription_models.dart';
import '../services/api_client.dart';
import '../services/subscription_service.dart';

class SubscriptionProvider extends ChangeNotifier {
  SubscriptionProvider(this._service);

  final SubscriptionService _service;

  Subscription? current;
  bool isLoading = false;
  String? errorMessage;

  Future<void> loadCurrent() async {
    isLoading = true;
    notifyListeners();
    try {
      current = await _service.getCurrent();
      errorMessage = null;
    } on ApiException catch (e) {
      errorMessage = e.message;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// Returns the Nomba checkout link to open for paid plans, or null if the
  /// upgrade was a free-plan switch applied immediately (no payment needed).
  Future<String?> upgrade(String planId) async {
    try {
      final result = await _service.upgrade(planId);
      errorMessage = null;
      return result.checkoutLink;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return null;
    }
  }

  Future<bool> cancel() async {
    try {
      await _service.cancel();
      await loadCurrent();
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }
}
