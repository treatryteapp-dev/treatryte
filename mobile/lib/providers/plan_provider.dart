import 'package:flutter/foundation.dart';

import '../models/plan_models.dart';
import '../services/api_client.dart';
import '../services/plan_service.dart';

class PlanProvider extends ChangeNotifier {
  PlanProvider(this._service);

  final PlanService _service;

  List<Plan> plans = [];
  bool isLoading = false;
  String? errorMessage;

  Future<void> loadPlans({String? type}) async {
    isLoading = true;
    notifyListeners();
    try {
      plans = await _service.fetchPlans(type: type);
      errorMessage = null;
    } on ApiException catch (e) {
      errorMessage = e.message;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> selectPlan(String planId) async {
    try {
      await _service.selectPlan(planId);
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }
}
