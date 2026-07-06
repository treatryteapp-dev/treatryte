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

  Future<VaultStats> getStats() => _api.get('/vault/stats', (data) => VaultStats.fromJson(data));

  Future<List<VaultFile>> getFiles({String? category}) => _api.get(
        '/vault/files',
        (data) => (data['files'] as List<dynamic>)
            .map((f) => VaultFile.fromJson(f as Map<String, dynamic>))
            .toList(),
        query: category != null ? {'category': category} : null,
      );

  Future<void> uploadFile({
    required String fileName,
    required String mimeType,
    required List<int> bytes,
    required String category,
  }) async {
    final presign = await _api.post(
      '/vault/files/presign',
      (data) => {'fileId': data['fileId'] as String, 'uploadUrl': data['uploadUrl'] as String},
      body: {
        'fileName': fileName,
        'mimeType': mimeType,
        'sizeBytes': bytes.length,
        'category': category,
      },
    );

    await _api.putRaw(presign['uploadUrl']!, bytes, contentType: mimeType);

    await _api.post('/vault/files/${presign['fileId']}/confirm', (_) => null);
  }
}
