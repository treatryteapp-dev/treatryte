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

  Future<Appointment> create({
    required String labId,
    required String testId,
    required String scheduledDate,
    required String scheduledTimeSlot,
  }) =>
      _api.post(
        '/appointments',
        (data) => Appointment.fromJson(data['appointment']),
        body: {
          'labId': labId,
          'testId': testId,
          'scheduledDate': scheduledDate,
          'scheduledTimeSlot': scheduledTimeSlot,
        },
      );

  Future<Appointment> pay(String appointmentId) =>
      _api.post('/appointments/$appointmentId/pay', (data) => Appointment.fromJson(data['appointment']));

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
