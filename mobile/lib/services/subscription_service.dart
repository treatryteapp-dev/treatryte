import '../models/subscription_models.dart';
import 'api_client.dart';

class SubscriptionService {
  SubscriptionService(this._api);

  final ApiClient _api;

  Future<UpgradeResult> upgrade(String planId) => _api.post(
    '/subscriptions/upgrade',
    (data) => UpgradeResult.fromJson(data as Map<String, dynamic>),
    body: {'planId': planId},
  );

  Future<Subscription?> getCurrent() => _api.get('/subscriptions/me', (data) {
    final subscription = (data as Map<String, dynamic>)['subscription'];
    return subscription == null
        ? null
        : Subscription.fromJson(subscription as Map<String, dynamic>);
  });

  Future<void> cancel() => _api.post('/subscriptions/cancel', (_) => null);
}
