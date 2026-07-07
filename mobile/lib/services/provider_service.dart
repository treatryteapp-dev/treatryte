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
      plan: data['plan'] != null
          ? Plan.fromJson(data['plan'] as Map<String, dynamic>)
          : null,
    ),
  );

  /// Puts a rejected application back to 'pending' after the partner has
  /// re-uploaded verification documents, so admin sees it needs review again.
  Future<PartnerLab> resubmit() => _api.post(
    '/provider/resubmit',
    (data) => PartnerLab.fromJson(data['lab'] as Map<String, dynamic>),
  );

  Future<List<PartnerService>> listServices() => _api.get(
    '/provider/services',
    (data) => (data['services'] as List<dynamic>)
        .map((s) => PartnerService.fromJson(s as Map<String, dynamic>))
        .toList(),
  );

  Future<void> createService({
    required String name,
    required int priceKobo,
    required String category,
  }) => _api.post(
    '/provider/services',
    (_) => null,
    body: {'name': name, 'price': priceKobo, 'category': category},
  );

  Future<void> updateService(
    String id, {
    String? name,
    int? priceKobo,
    String? category,
  }) => _api.put(
    '/provider/services/$id',
    (_) => null,
    body: {
      if (name != null) 'name': name,
      if (priceKobo != null) 'price': priceKobo,
      if (category != null) 'category': category,
    },
  );

  Future<void> deleteService(String id) =>
      _api.delete('/provider/services/$id', (_) => null);

  Future<List<PartnerPatient>> listPatients() => _api.get(
    '/provider/patients',
    (data) => (data['patients'] as List<dynamic>)
        .map((p) => PartnerPatient.fromJson(p as Map<String, dynamic>))
        .toList(),
  );

  /// Finds-or-creates a patient directory entry for this lab by email - a
  /// walk-in with no TreatRyte account works exactly the same as a real
  /// patient here, since a lookup by email is all that's required.
  Future<PartnerPatient> createPatient({
    required String fullName,
    required String email,
    String? dateOfBirth,
    String? gender,
  }) => _api.post(
    '/provider/patients',
    (data) => PartnerPatient.fromJson(data['patient'] as Map<String, dynamic>),
    body: {
      'fullName': fullName,
      'email': email,
      if (dateOfBirth != null) 'dateOfBirth': dateOfBirth,
      if (gender != null) 'gender': gender,
    },
  );

  Future<PatientDetail> getPatientDetail(String patientId) => _api.get(
    '/provider/patients/$patientId',
    (data) => PatientDetail.fromJson(data as Map<String, dynamic>),
  );

  Future<MedicalRecord> issueMedicalRecord(
    String patientId, {
    required String visitType,
    String? notes,
    String? fileUrl,
    String? fileName,
    String? fileId,
  }) => _api.post(
    '/provider/patients/$patientId/records',
    (data) => MedicalRecord.fromJson(data['record'] as Map<String, dynamic>),
    body: {
      'visitType': visitType,
      if (notes != null) 'notes': notes,
      if (fileUrl != null) 'fileUrl': fileUrl,
      if (fileName != null) 'fileName': fileName,
      if (fileId != null) 'fileId': fileId,
    },
  );

  Future<void> addPrescription(
    String patientId, {
    required String medicineName,
    required String dosage,
    required String duration,
    String? notes,
    String? startDate,
    String? endDate,
    String? timesDaily,
    String? fileUrl,
    String? fileName,
    String? fileId,
    List<Map<String, dynamic>>? drugs,
  }) => _api.post(
    '/provider/patients/$patientId/prescriptions',
    (_) => null,
    body: {
      if (drugs != null && drugs.isNotEmpty)
        'drugs': drugs
      else ...{
        'medicineName': medicineName,
        'dosage': dosage,
        'duration': duration,
        if (notes != null) 'notes': notes,
        if (startDate != null) 'startDate': startDate,
        if (endDate != null) 'endDate': endDate,
        if (timesDaily != null) 'timesDaily': timesDaily,
        if (fileUrl != null) 'fileUrl': fileUrl,
        if (fileName != null) 'fileName': fileName,
        if (fileId != null) 'fileId': fileId,
      }
    },
  );

  Future<Map<String, String>> uploadPatientFile(
    String patientId, {
    required String fileName,
    required String mimeType,
    required List<int> bytes,
    required String category,
  }) async {
    final presign = await _api.post(
      '/provider/patients/$patientId/files/presign',
      (data) => {
        'fileId': data['fileId'] as String,
        'uploadUrl': data['uploadUrl'] as String,
      },
      body: {
        'fileName': fileName,
        'mimeType': mimeType,
        'sizeBytes': bytes.length,
        'category': category,
      },
    );

    await _api.putRaw(presign['uploadUrl']!, bytes, contentType: mimeType);

    final confirmed = await _api.post(
      '/provider/patients/$patientId/files/${presign['fileId']}/confirm',
      (data) => data['file'] as Map<String, dynamic>,
      body: {'fileId': presign['fileId']},
    );

    return {
      'fileId': presign['fileId']!,
      'fileName': fileName,
      'fileUrl': confirmed['url'] as String? ?? '',
    };
  }

  Future<void> invitePatient(String email) => _api.post(
    '/provider/patients/invite',
    (_) => null,
    body: {'email': email},
  );
}
