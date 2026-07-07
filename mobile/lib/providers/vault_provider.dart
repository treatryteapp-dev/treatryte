import 'package:flutter/foundation.dart';

import '../models/vault_models.dart';
import '../services/api_client.dart';
import '../services/vault_service.dart';

class VaultProvider extends ChangeNotifier {
  VaultProvider(this._service);

  final VaultService _service;

  List<VaultCategory> categories = [];
  List<VaultFolder> folders = [];
  VaultStats? stats;
  bool isLoading = false;
  String? errorMessage;

  List<VaultFile> currentFolderFiles = [];
  bool isLoadingFolderFiles = false;
  String? folderFilesError;

  Future<void> refresh() async {
    isLoading = true;
    notifyListeners();
    try {
      categories = await _service.getCategories();
      folders = await _service.getFolders();
      stats = await _service.getStats();
      errorMessage = null;
    } on ApiException catch (e) {
      errorMessage = e.message;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// Returns null on failure (e.g. the plan's folder limit was reached) -
  /// [errorMessage] carries the reason either way.
  Future<VaultFolder?> createFolder(String name) async {
    try {
      final folder = await _service.createFolder(name);
      await refresh();
      errorMessage = null;
      return folder;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return null;
    }
  }

  Future<void> loadFolderFiles(String folderId) async {
    isLoadingFolderFiles = true;
    notifyListeners();
    try {
      currentFolderFiles = await _service.getFiles(folderId: folderId);
      folderFilesError = null;
    } on ApiException catch (e) {
      folderFilesError = e.message;
    } finally {
      isLoadingFolderFiles = false;
      notifyListeners();
    }
  }

  Future<VaultFile?> getFile(String fileId) async {
    try {
      return await _service.getFile(fileId);
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return null;
    }
  }

  Future<bool> uploadFile({
    required String fileName,
    required String mimeType,
    required List<int> bytes,
    required String category,
    String? folderId,
    String? source,
    String? hospitalName,
  }) async {
    try {
      await _service.uploadFile(
        fileName: fileName,
        mimeType: mimeType,
        bytes: bytes,
        category: category,
        folderId: folderId,
        source: source,
        hospitalName: hospitalName,
      );
      await refresh();
      if (folderId != null) await loadFolderFiles(folderId);
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }
}
