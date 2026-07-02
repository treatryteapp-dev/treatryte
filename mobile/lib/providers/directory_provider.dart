import 'package:flutter/foundation.dart';

import '../models/directory_models.dart';
import '../services/directory_service.dart';

class DirectoryProvider extends ChangeNotifier {
  DirectoryProvider(this._service);

  final DirectoryService _service;

  List<Lab> featuredLabs = [];
  List<LabTest> trendingTests = [];
  List<Clinic> clinics = [];
  bool isLoading = false;

  Future<void> refresh({String? clinicType}) async {
    isLoading = true;
    notifyListeners();
    try {
      featuredLabs = await _service.getFeaturedLabs();
      trendingTests = await _service.getTrendingTests();
      clinics = await _service.getClinics(type: clinicType);
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> filterClinics(String type) async {
    clinics = await _service.getClinics(type: type);
    notifyListeners();
  }
}
