import 'package:flutter/foundation.dart';

import '../models/vault_models.dart';
import '../services/api_client.dart';
import '../services/vault_service.dart';

class VaultProvider extends ChangeNotifier {
  VaultProvider(this._service);

  final VaultService _service;

  List<VaultCategory> categories = [];
  VaultStats? stats;
  bool isLoading = false;
  String? errorMessage;

  Future<void> refresh() async {
    isLoading = true;
    notifyListeners();
    try {
      categories = await _service.getCategories();
      stats = await _service.getStats();
      errorMessage = null;
    } on ApiException catch (e) {
      errorMessage = e.message;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> uploadFile({
    required String fileName,
    required String mimeType,
    required List<int> bytes,
    required String category,
  }) async {
    try {
      await _service.uploadFile(fileName: fileName, mimeType: mimeType, bytes: bytes, category: category);
      await refresh();
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }
}
