import '../models/vault_models.dart';
import 'api_client.dart';

class VaultService {
  VaultService(this._api);

  final ApiClient _api;

  Future<List<VaultCategory>> getCategories() => _api.get(
    '/vault/categories',
    (data) => (data['categories'] as List<dynamic>)
        .map((c) => VaultCategory.fromJson(c as Map<String, dynamic>))
        .toList(),
  );

  Future<VaultStats> getStats() =>
      _api.get('/vault/stats', (data) => VaultStats.fromJson(data));

  Future<List<VaultFolder>> getFolders() => _api.get(
    '/vault/folders',
    (data) => (data['folders'] as List<dynamic>)
        .map((f) => VaultFolder.fromJson(f as Map<String, dynamic>))
        .toList(),
  );

  Future<VaultFolder> createFolder(String name) => _api.post(
    '/vault/folders',
    (data) => VaultFolder.fromJson(data['folder'] as Map<String, dynamic>),
    body: {'name': name},
  );

  Future<List<VaultFile>> getFiles({String? category, String? folderId}) =>
      _api.get(
        '/vault/files',
        (data) => (data['files'] as List<dynamic>)
            .map((f) => VaultFile.fromJson(f as Map<String, dynamic>))
            .toList(),
        query: {
          if (category != null) 'category': category,
          if (folderId != null) 'folderId': folderId,
        },
      );

  /// [folderId] is required for a patient's own vault uploads - it's only
  /// omitted for the special `partner_verification` category used during
  /// partner registration/resubmission, which isn't part of the folder
  /// system at all.
  Future<void> uploadFile({
    required String fileName,
    required String mimeType,
    required List<int> bytes,
    required String category,
    String? folderId,
  }) async {
    final presign = await _api.post(
      '/vault/files/presign',
      (data) => {
        'fileId': data['fileId'] as String,
        'uploadUrl': data['uploadUrl'] as String,
      },
      body: {
        'fileName': fileName,
        'mimeType': mimeType,
        'sizeBytes': bytes.length,
        'category': category,
        if (folderId != null) 'folderId': folderId,
      },
    );

    await _api.putRaw(presign['uploadUrl']!, bytes, contentType: mimeType);

    await _api.post('/vault/files/${presign['fileId']}/confirm', (_) => null);
  }
}
