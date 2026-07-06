import '../models/medication_models.dart';
import 'api_client.dart';

class TodaySchedule {
  const TodaySchedule(this.schedule, this.nextDose);
  final List<DoseScheduleItem> schedule;
  final DoseScheduleItem? nextDose;
}

class MedicationService {
  MedicationService(this._api);

  final ApiClient _api;

  Future<String> getPlanStatus() =>
      _api.get('/medications', (data) => data['planStatus'] as String);

  Future<TodaySchedule> getTodaySchedule() =>
      _api.get('/medications/today', (data) {
        final schedule = (data['schedule'] as List<dynamic>)
            .map((s) => DoseScheduleItem.fromJson(s as Map<String, dynamic>))
            .toList();
        final nextDose = data['nextDose'] != null
            ? DoseScheduleItem.fromJson(data['nextDose'])
            : null;
        return TodaySchedule(schedule, nextDose);
      });

  Future<void> logDose(String doseLogId) =>
      _api.post('/medications/doses/$doseLogId/log', (_) => null);

  Future<void> submitMood(
    String doseLogId, {
    required String mood,
    String? note,
  }) => _api.post(
    '/medications/doses/$doseLogId/mood',
    (_) => null,
    body: {'mood': mood, if (note != null) 'note': note},
  );
}
