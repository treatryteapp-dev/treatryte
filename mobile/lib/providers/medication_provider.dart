import 'package:flutter/foundation.dart';

import '../models/medication_models.dart';
import '../services/medication_service.dart';

class MedicationProvider extends ChangeNotifier {
  MedicationProvider(this._service);

  final MedicationService _service;

  List<DoseScheduleItem> schedule = [];
  DoseScheduleItem? nextDose;
  String planStatus = 'inactive';
  bool isLoading = false;

  Future<void> refresh() async {
    isLoading = true;
    notifyListeners();
    try {
      planStatus = await _service.getPlanStatus();
      final today = await _service.getTodaySchedule();
      schedule = today.schedule;
      nextDose = today.nextDose;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logDose(String doseLogId) async {
    await _service.logDose(doseLogId);
    await refresh();
  }

  Future<void> submitMood(
    String doseLogId, {
    required String mood,
    String? note,
  }) => _service.submitMood(doseLogId, mood: mood, note: note);
}
