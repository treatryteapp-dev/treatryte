import '../models/appointment_models.dart';
import 'api_client.dart';

class AppointmentService {
  AppointmentService(this._api);

  final ApiClient _api;

  Future<Availability> getAvailability(String labId) => _api.get(
        '/appointments/availability',
        (data) => Availability.fromJson(data as Map<String, dynamic>),
        query: {'labId': labId},
      );

  /// One appointment can bundle several of a partner's services (e.g. a
  /// patient booking 5 tests at once) - the backend charges one service fee
  /// for the whole booking rather than once per service.
  Future<Appointment> create({
    required String labId,
    required List<String> testIds,
    required String scheduledDate,
    required String scheduledTimeSlot,
  }) =>
      _api.post(
        '/appointments',
        (data) => Appointment.fromJson(data['appointment']),
        body: {
          'labId': labId,
          'testIds': testIds,
          'scheduledDate': scheduledDate,
          'scheduledTimeSlot': scheduledTimeSlot,
        },
      );

  Future<List<Appointment>> listForProvider() => _api.get(
        '/provider/appointments',
        (data) => (data['appointments'] as List<dynamic>)
            .map((a) => Appointment.fromJson(a as Map<String, dynamic>))
            .toList(),
      );

  Future<void> checkIn(String appointmentId) =>
      _api.post('/provider/appointments/$appointmentId/checkin', (_) => null);

  Future<void> reschedule(String appointmentId, {required String scheduledDate, required String scheduledTimeSlot}) =>
      _api.post(
        '/provider/appointments/$appointmentId/reschedule',
        (_) => null,
        body: {'scheduledDate': scheduledDate, 'scheduledTimeSlot': scheduledTimeSlot},
      );

  Future<void> cancel(String appointmentId) => _api.post('/provider/appointments/$appointmentId/cancel', (_) => null);
}
