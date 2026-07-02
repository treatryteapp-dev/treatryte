import '../models/directory_models.dart';
import 'api_client.dart';

class DirectoryService {
  DirectoryService(this._api);

  final ApiClient _api;

  Future<List<Lab>> getFeaturedLabs() => _api.get(
        '/directory/labs',
        (data) => (data['labs'] as List<dynamic>).map((l) => Lab.fromJson(l as Map<String, dynamic>)).toList(),
        query: {'featured': 'true'},
      );

  Future<List<LabTest>> getTrendingTests() => _api.get(
        '/directory/tests/trending',
        (data) =>
            (data['tests'] as List<dynamic>).map((t) => LabTest.fromJson(t as Map<String, dynamic>)).toList(),
      );

  Future<List<Clinic>> getClinics({String? type}) => _api.get(
        '/directory/clinics',
        (data) => (data['clinics'] as List<dynamic>)
            .map((c) => Clinic.fromJson(c as Map<String, dynamic>))
            .toList(),
        query: type != null && type != 'all' ? {'type': type} : null,
      );
}
