import '../models/plan_models.dart';
import '../models/provider_models.dart';
import 'api_client.dart';

class PartnerProfile {
  const PartnerProfile({required this.lab, this.plan});
  final PartnerLab lab;
  final Plan? plan;
}

class ProviderService {
  ProviderService(this._api);

  final ApiClient _api;

  Future<PartnerProfile> getProfile() => _api.get(
        '/provider/profile',
        (data) => PartnerProfile(
          lab: PartnerLab.fromJson(data['lab'] as Map<String, dynamic>),
          plan: data['plan'] != null ? Plan.fromJson(data['plan'] as Map<String, dynamic>) : null,
        ),
      );

  Future<List<PartnerService>> listServices() => _api.get(
        '/provider/services',
        (data) =>
            (data['services'] as List<dynamic>).map((s) => PartnerService.fromJson(s as Map<String, dynamic>)).toList(),
      );

  Future<void> createService({required String name, required int priceKobo, required String category}) =>
      _api.post('/provider/services', (_) => null, body: {'name': name, 'price': priceKobo, 'category': category});

  Future<void> updateService(String id, {String? name, int? priceKobo, String? category}) => _api.put(
        '/provider/services/$id',
        (_) => null,
        body: {
          if (name != null) 'name': name,
          if (priceKobo != null) 'price': priceKobo,
          if (category != null) 'category': category,
        },
      );

  Future<void> deleteService(String id) => _api.delete('/provider/services/$id', (_) => null);
}
