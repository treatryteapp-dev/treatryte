import 'package:flutter/foundation.dart';

import '../models/appointment_models.dart';
import '../services/api_client.dart';
import '../services/appointment_service.dart';

class AppointmentProvider extends ChangeNotifier {
  AppointmentProvider(this._service);

  final AppointmentService _service;

  List<AvailabilityDay> availability = [];
  int serviceFeeKobo = 0;
  Appointment? currentAppointment;
  bool isLoading = false;
  String? errorMessage;

  Future<void> loadAvailability(String labId) async {
    isLoading = true;
    notifyListeners();
    try {
      final result = await _service.getAvailability(labId);
      availability = result.days;
      serviceFeeKobo = result.serviceFeeKobo;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> bookAndPay({
    required String labId,
    required String testId,
    required String scheduledDate,
    required String scheduledTimeSlot,
  }) async {
    try {
      final appointment = await _service.create(
        labId: labId,
        testId: testId,
        scheduledDate: scheduledDate,
        scheduledTimeSlot: scheduledTimeSlot,
      );
      currentAppointment = await _service.pay(appointment.id);
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }
}
