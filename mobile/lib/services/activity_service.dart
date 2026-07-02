import '../models/activity_item.dart';
import 'api_client.dart';

class ActivityService {
  ActivityService(this._api);

  final ApiClient _api;

  Future<List<ActivityItem>> getRecent({int limit = 5}) => _api.get(
        '/activities',
        (data) => (data['activities'] as List<dynamic>)
            .map((a) => ActivityItem.fromJson(a as Map<String, dynamic>))
            .toList(),
        query: {'limit': limit},
      );
}
