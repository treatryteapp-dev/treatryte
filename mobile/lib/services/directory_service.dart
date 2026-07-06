import '../models/directory_models.dart';
import 'api_client.dart';

class DirectoryService {
  DirectoryService(this._api);

  final ApiClient _api;

  Future<List<Lab>> getFeaturedLabs() => _api.get(
    '/directory/labs',
    (data) => (data['labs'] as List<dynamic>)
        .map((l) => Lab.fromJson(l as Map<String, dynamic>))
        .toList(),
    query: {'featured': 'true'},
  );

  /// All admin-approved labs, not just the curated "featured" subset -
  /// this is what makes an approved partner actually discoverable.
  /// [type] filters by a partner's declared category (e.g. "Diagnostics"),
  /// [query] performs a real backend name search, [state] filters by the
  /// partner's registered state - all forwarded straight to the API.
  Future<List<Lab>> getApprovedLabs({
    String? type,
    String? query,
    String? state,
  }) => _api.get(
    '/directory/labs',
    (data) => (data['labs'] as List<dynamic>)
        .map((l) => Lab.fromJson(l as Map<String, dynamic>))
        .toList(),
    query: {
      if (type != null && type != 'all') 'type': type,
      if (query != null && query.trim().isNotEmpty) 'q': query.trim(),
      if (state != null && state != 'all') 'state': state,
    },
  );

  Future<List<LabTest>> getTrendingTests() => _api.get(
    '/directory/tests/trending',
    (data) => (data['tests'] as List<dynamic>)
        .map((t) => LabTest.fromJson(t as Map<String, dynamic>))
        .toList(),
  );
}
