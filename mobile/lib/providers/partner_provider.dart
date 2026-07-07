import 'package:flutter/foundation.dart';

import '../models/appointment_models.dart';
import '../models/patient_models.dart';
import '../models/plan_models.dart';
import '../models/provider_models.dart';
import '../services/api_client.dart';
import '../services/appointment_service.dart';
import '../services/provider_service.dart';

class PartnerProvider extends ChangeNotifier {
  PartnerProvider(this._service, this._appointmentService);

  final ProviderService _service;
  final AppointmentService _appointmentService;

  PartnerLab? lab;
  Plan? plan;
  List<PartnerService> services = [];
  bool isLoading = false;
  String? errorMessage;

  List<Appointment> appointments = [];
  bool isLoadingAppointments = false;
  String? appointmentsError;

  List<PartnerPatient> patients = [];
  bool isLoadingPatients = false;
  String? patientsError;

  PatientDetail? selectedPatientDetail;
  bool isLoadingPatientDetail = false;
  String? patientDetailError;

  List<PatientFeedbackGroup> feedbacks = [];
  bool isLoadingFeedbacks = false;
  String? feedbacksError;

  Future<void> loadProfile() async {
    isLoading = true;
    notifyListeners();
    try {
      final profile = await _service.getProfile();
      lab = profile.lab;
      plan = profile.plan;
      errorMessage = null;
    } on ApiException catch (e) {
      errorMessage = e.message;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> resubmit() async {
    try {
      lab = await _service.resubmit();
      errorMessage = null;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<void> loadServices() async {
    isLoading = true;
    notifyListeners();
    try {
      services = await _service.listServices();
      errorMessage = null;
    } on ApiException catch (e) {
      errorMessage = e.message;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createService({
    required String name,
    required int priceKobo,
    required String category,
  }) async {
    try {
      await _service.createService(
        name: name,
        priceKobo: priceKobo,
        category: category,
      );
      await loadServices();
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateService(
    String id, {
    String? name,
    int? priceKobo,
    String? category,
  }) async {
    try {
      await _service.updateService(
        id,
        name: name,
        priceKobo: priceKobo,
        category: category,
      );
      await loadServices();
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteService(String id) async {
    try {
      await _service.deleteService(id);
      await loadServices();
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<void> loadAppointments() async {
    isLoadingAppointments = true;
    notifyListeners();
    try {
      appointments = await _appointmentService.listForProvider();
      appointmentsError = null;
    } on ApiException catch (e) {
      appointmentsError = e.message;
    } finally {
      isLoadingAppointments = false;
      notifyListeners();
    }
  }

  Future<bool> checkIn(String appointmentId) async {
    try {
      await _appointmentService.checkIn(appointmentId);
      await loadAppointments();
      return true;
    } on ApiException catch (e) {
      appointmentsError = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<bool> reschedule(
    String appointmentId, {
    required String scheduledDate,
    required String scheduledTimeSlot,
  }) async {
    try {
      await _appointmentService.reschedule(
        appointmentId,
        scheduledDate: scheduledDate,
        scheduledTimeSlot: scheduledTimeSlot,
      );
      await loadAppointments();
      return true;
    } on ApiException catch (e) {
      appointmentsError = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<bool> cancelAppointment(String appointmentId) async {
    try {
      await _appointmentService.cancel(appointmentId);
      await loadAppointments();
      return true;
    } on ApiException catch (e) {
      appointmentsError = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<void> loadPatients() async {
    isLoadingPatients = true;
    notifyListeners();
    try {
      patients = await _service.listPatients();
      patientsError = null;
    } on ApiException catch (e) {
      patientsError = e.message;
    } finally {
      isLoadingPatients = false;
      notifyListeners();
    }
  }

  Future<void> loadPatientDetail(String patientId) async {
    isLoadingPatientDetail = true;
    notifyListeners();
    try {
      selectedPatientDetail = await _service.getPatientDetail(patientId);
      patientDetailError = null;
    } on ApiException catch (e) {
      patientDetailError = e.toString();
    } finally {
      isLoadingPatientDetail = false;
      notifyListeners();
    }
  }

  Future<void> loadFeedbacks() async {
    isLoadingFeedbacks = true;
    feedbacksError = null;
    notifyListeners();
    try {
      feedbacks = await _service.getFeedbacks();
    } catch (e) {
      feedbacksError = e.toString();
    } finally {
      isLoadingFeedbacks = false;
      notifyListeners();
    }
  }

  Future<bool> addPrescription(
    String patientId, {
    String medicineName = '',
    String dosage = '',
    String duration = '',
    String? notes,
    String? startDate,
    String? endDate,
    String? timesDaily,
    String? fileUrl,
    String? fileName,
    String? fileId,
    List<Map<String, dynamic>>? drugs,
  }) async {
    try {
      await _service.addPrescription(
        patientId,
        medicineName: medicineName,
        dosage: dosage,
        duration: duration,
        notes: notes,
        startDate: startDate,
        endDate: endDate,
        timesDaily: timesDaily,
        fileUrl: fileUrl,
        fileName: fileName,
        fileId: fileId,
        drugs: drugs,
      );
      await loadPatientDetail(patientId);
      return true;
    } on ApiException catch (e) {
      patientDetailError = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<bool> invitePatient(String email) async {
    try {
      await _service.invitePatient(email);
      return true;
    } on ApiException catch (e) {
      patientsError = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Finds-or-creates a patient directory entry by email, refreshing the
  /// list either way - returns null on failure.
  Future<PartnerPatient?> createPatient({
    required String fullName,
    required String email,
    String? dateOfBirth,
    String? gender,
  }) async {
    try {
      final patient = await _service.createPatient(
        fullName: fullName,
        email: email,
        dateOfBirth: dateOfBirth,
        gender: gender,
      );
      await loadPatients();
      return patient;
    } on ApiException catch (e) {
      patientsError = e.message;
      notifyListeners();
      return null;
    }
  }

  Future<bool> issueMedicalRecords(
    String patientId, {
    required List<Map<String, dynamic>> records,
  }) async {
    try {
      await _service.issueMedicalRecords(
        patientId,
        records: records,
      );
      await Future.wait([loadPatientDetail(patientId), loadPatients()]);
      return true;
    } on ApiException catch (e) {
      patientDetailError = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<Map<String, String>?> uploadPatientFile(
    String patientId, {
    required String fileName,
    required String mimeType,
    required List<int> bytes,
    required String category,
  }) async {
    try {
      final res = await _service.uploadPatientFile(
        patientId,
        fileName: fileName,
        mimeType: mimeType,
        bytes: bytes,
        category: category,
      );
      await loadPatientDetail(patientId);
      return res;
    } on ApiException catch (e) {
      patientDetailError = e.message;
      notifyListeners();
      return null;
    }
  }
}
