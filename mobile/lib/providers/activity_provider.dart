import 'package:flutter/foundation.dart';

import '../models/activity_item.dart';
import '../services/activity_service.dart';

class ActivityProvider extends ChangeNotifier {
  ActivityProvider(this._service);

  final ActivityService _service;

  List<ActivityItem> recent = [];
  bool isLoading = false;

  Future<void> refresh() async {
    isLoading = true;
    notifyListeners();
    try {
      recent = await _service.getRecent();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
