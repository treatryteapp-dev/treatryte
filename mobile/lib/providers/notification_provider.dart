import 'package:flutter/foundation.dart';

import '../models/notification_item.dart';
import '../services/notification_service.dart';

class NotificationProvider extends ChangeNotifier {
  NotificationProvider(this._service);

  final NotificationService _service;

  List<NotificationItem> today = [];
  List<NotificationItem> yesterday = [];
  List<NotificationItem> earlier = [];
  bool isLoading = false;

  Future<void> refresh() async {
    isLoading = true;
    notifyListeners();
    try {
      final grouped = await _service.getGrouped();
      today = grouped.today;
      yesterday = grouped.yesterday;
      earlier = grouped.earlier;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markAllRead() async {
    await _service.markAllRead();
    await refresh();
  }
}
