import 'package:flutter/foundation.dart';

import '../models/activity_item.dart';
import '../services/activity_service.dart';

class ActivityProvider extends ChangeNotifier {
  ActivityProvider(this._service);

  final ActivityService _service;

  List<ActivityItem> recent = [];
  bool isLoading = false;

  List<ActivityItem> all = [];
  bool isLoadingAll = false;

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

  // The backend only supports a limit, not real pagination yet - a large
  // limit is a pragmatic stand-in for a full history until it does.
  Future<void> loadAll() async {
    isLoadingAll = true;
    notifyListeners();
    try {
      all = await _service.getRecent(limit: 200);
    } finally {
      isLoadingAll = false;
      notifyListeners();
    }
  }
}
