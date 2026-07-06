import '../models/plan_models.dart';
import 'api_client.dart';

class PlanService {
  PlanService(this._api);

  final ApiClient _api;

  Future<List<Plan>> fetchPlans({String? type}) => _api.get(
    '/plans',
    (data) => (data['plans'] as List<dynamic>)
        .map((p) => Plan.fromJson(p as Map<String, dynamic>))
        .toList(),
    query: type != null ? {'type': type} : null,
  );

  Future<void> selectPlan(String planId) =>
      _api.patch('/auth/me/plan', (_) => null, body: {'planId': planId});
}
