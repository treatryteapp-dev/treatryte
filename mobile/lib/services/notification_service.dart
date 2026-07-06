import '../models/notification_item.dart';
import 'api_client.dart';

class GroupedNotifications {
  const GroupedNotifications({
    required this.today,
    required this.yesterday,
    required this.earlier,
  });

  final List<NotificationItem> today;
  final List<NotificationItem> yesterday;
  final List<NotificationItem> earlier;
}

class NotificationService {
  NotificationService(this._api);

  final ApiClient _api;

  Future<GroupedNotifications> getGrouped() => _api.get(
    '/notifications',
    (data) => GroupedNotifications(
      today: _parseList(data['today']),
      yesterday: _parseList(data['yesterday']),
      earlier: _parseList(data['earlier']),
    ),
    query: {'grouped': 'true'},
  );

  List<NotificationItem> _parseList(dynamic list) => (list as List<dynamic>)
      .map((n) => NotificationItem.fromJson(n as Map<String, dynamic>))
      .toList();

  Future<void> markRead(String id) =>
      _api.patch('/notifications/$id/read', (_) => null);

  Future<void> markAllRead() =>
      _api.patch('/notifications/read-all', (_) => null);
}
