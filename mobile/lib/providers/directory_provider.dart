import 'package:flutter/foundation.dart';

import '../models/directory_models.dart';
import '../services/directory_service.dart';

class DirectoryProvider extends ChangeNotifier {
  DirectoryProvider(this._service);

  final DirectoryService _service;

  // All admin-approved labs, not just the curated "featured" subset - an
  // approved partner needs to actually be discoverable here.
  List<Lab> labs = [];
  List<LabTest> trendingTests = [];
  bool isLoading = false;
  String _type = 'all';
  String _query = '';
  String _state = 'all';

  Future<void> refresh({String? type, String? query, String? state}) async {
    _type = type ?? _type;
    _query = query ?? _query;
    _state = state ?? _state;
    isLoading = true;
    notifyListeners();
    try {
      labs = await _service.getApprovedLabs(type: _type, query: _query, state: _state);
      trendingTests = await _service.getTrendingTests();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
