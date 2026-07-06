import '../models/connection_models.dart';
import 'api_client.dart';

class ConnectionService {
  ConnectionService(this._api);

  final ApiClient _api;

  Future<List<PartnerConnection>> list() => _api.get(
        '/connections',
        (data) => (data['connections'] as List<dynamic>)
            .map((c) => PartnerConnection.fromJson(c as Map<String, dynamic>))
            .toList(),
      );

  Future<void> accept(String id, {required bool shareAll, List<String>? folderIds}) => _api.post(
        '/connections/$id/accept',
        (_) => null,
        body: {
          'shareAll': shareAll,
          if (folderIds != null) 'folderIds': folderIds,
        },
      );

  Future<void> decline(String id) => _api.post('/connections/$id/decline', (_) => null);
}
