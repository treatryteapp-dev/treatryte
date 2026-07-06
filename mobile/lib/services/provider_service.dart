import '../models/patient_models.dart';
import '../models/plan_models.dart';
import '../models/provider_models.dart';
import 'api_client.dart';

class PartnerProfile {
  const PartnerProfile({required this.lab, this.plan});
  final PartnerLab lab;
  final Plan? plan;
}

class ProviderService {
  ProviderService(this._api);

  final ApiClient _api;

  Future<PartnerProfile> getProfile() => _api.get(
        '/provider/profile',
        (data) => PartnerProfile(
          lab: PartnerLab.fromJson(data['lab'] as Map<String, dynamic>),
          plan: data['plan'] != null ? Plan.fromJson(data['plan'] as Map<String, dynamic>) : null,
        ),
      );

  /// Puts a rejected application back to 'pending' after the partner has
  /// re-uploaded verification documents, so admin sees it needs review again.
  Future<PartnerLab> resubmit() =>
      _api.post('/provider/resubmit', (data) => PartnerLab.fromJson(data['lab'] as Map<String, dynamic>));

  Future<List<PartnerService>> listServices() => _api.get(
        '/provider/services',
        (data) =>
            (data['services'] as List<dynamic>).map((s) => PartnerService.fromJson(s as Map<String, dynamic>)).toList(),
      );

  Future<void> createService({required String name, required int priceKobo, required String category}) =>
      _api.post('/provider/services', (_) => null, body: {'name': name, 'price': priceKobo, 'category': category});

  Future<void> updateService(String id, {String? name, int? priceKobo, String? category}) => _api.put(
        '/provider/services/$id',
        (_) => null,
        body: {
          if (name != null) 'name': name,
          if (priceKobo != null) 'price': priceKobo,
          if (category != null) 'category': category,
        },
      );

  Future<void> deleteService(String id) => _api.delete('/provider/services/$id', (_) => null);

  Future<List<PartnerPatient>> listPatients() => _api.get(
        '/provider/patients',
        (data) =>
            (data['patients'] as List<dynamic>).map((p) => PartnerPatient.fromJson(p as Map<String, dynamic>)).toList(),
      );

  Future<PatientDetail> getPatientDetail(String patientId) =>
      _api.get('/provider/patients/$patientId', (data) => PatientDetail.fromJson(data as Map<String, dynamic>));

  Future<void> addPrescription(
    String patientId, {
    required String medicineName,
    required String dosage,
    required String duration,
    String? notes,
  }) =>
      _api.post(
        '/provider/patients/$patientId/prescriptions',
        (_) => null,
        body: {
          'medicineName': medicineName,
          'dosage': dosage,
          'duration': duration,
          if (notes != null) 'notes': notes,
        },
      );

  Future<void> invitePatient(String email) =>
      _api.post('/provider/patients/invite', (_) => null, body: {'email': email});
}
