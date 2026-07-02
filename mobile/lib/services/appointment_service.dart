import '../models/appointment_models.dart';
import 'api_client.dart';

class AppointmentService {
  AppointmentService(this._api);

  final ApiClient _api;

  Future<List<AvailabilityDay>> getAvailability(String labId) => _api.get(
        '/appointments/availability',
        (data) => (data['days'] as List<dynamic>)
            .map((d) => AvailabilityDay.fromJson(d as Map<String, dynamic>))
            .toList(),
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
}
