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

  List<Appointment> appointments = [];
  bool isLoadingAppointments = false;

  Future<void> loadAppointments() async {
    isLoadingAppointments = true;
    notifyListeners();
    try {
      appointments = await _service.list();
      errorMessage = null;
    } on ApiException catch (e) {
      errorMessage = e.message;
    } finally {
      isLoadingAppointments = false;
      notifyListeners();
    }
  }

  Future<void> loadAvailability(String labId) async {
    isLoading = true;
    notifyListeners();
    try {
      final result = await _service.getAvailability(labId);
      availability = result.days;
      serviceFeeKobo = result.serviceFeeKobo;
      errorMessage = null;
    } on ApiException catch (e) {
      errorMessage = e.message;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> bookAndPay({
    required String labId,
    required List<String> testIds,
    required String scheduledDate,
    required String scheduledTimeSlot,
  }) async {
    try {
      // Booking and payment are one atomic backend call - a declined/
      // insufficient-funds payment throws before anything is created, so
      // there's no separate "pay" step (and no orphaned pending booking).
      currentAppointment = await _service.create(
        labId: labId,
        testIds: testIds,
        scheduledDate: scheduledDate,
        scheduledTimeSlot: scheduledTimeSlot,
      );
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }
}
