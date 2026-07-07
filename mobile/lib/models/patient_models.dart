import 'vault_models.dart';

class MedicalProfile {
  const MedicalProfile({
    required this.bloodGroup,
    required this.allergies,
    required this.conditions,
  });

  factory MedicalProfile.fromJson(Map<String, dynamic> json) => MedicalProfile(
    bloodGroup: json['bloodGroup'] as String?,
    allergies: (json['allergies'] as List<dynamic>? ?? [])
        .map((a) => a as String)
        .toList(),
    conditions: (json['conditions'] as List<dynamic>? ?? [])
        .map((c) => c as String)
        .toList(),
  );

  final String? bloodGroup;
  final List<String> allergies;
  final List<String> conditions;
}

class PartnerPatient {
  const PartnerPatient({
    required this.id,
    required this.patientCode,
    required this.fullName,
    required this.email,
    required this.dateOfBirth,
    required this.gender,
    required this.lastVisit,
  });

  factory PartnerPatient.fromJson(Map<String, dynamic> json) => PartnerPatient(
    id: json['id'] as String,
    patientCode: json['patientCode'] as String? ?? '',
    fullName: json['fullName'] as String,
    email: json['email'] as String? ?? '',
    dateOfBirth: DateTime.tryParse(json['dateOfBirth'] as String? ?? ''),
    gender: json['gender'] as String?,
    lastVisit: DateTime.tryParse(json['lastVisit'] as String? ?? ''),
  );

  final String id;
  final String patientCode;
  final String fullName;
  final String email;
  final DateTime? dateOfBirth;
  final String? gender;
  final DateTime? lastVisit;
}

class MedicalRecord {
  const MedicalRecord({
    required this.id,
    required this.visitType,
    required this.notes,
    required this.createdAt,
    this.fileUrl,
    this.fileName,
    this.files = const [],
  });

  factory MedicalRecord.fromJson(Map<String, dynamic> json) => MedicalRecord(
    id: json['_id'] as String,
    visitType: json['visitType'] as String,
    notes: json['notes'] as String? ?? '',
    createdAt: DateTime.tryParse(json['createdAt'] as String? ?? ''),
    fileUrl: json['fileUrl'] as String?,
    fileName: json['fileName'] as String?,
    files: (json['files'] as List<dynamic>? ?? []).map((f) => {
      'fileUrl': (f as Map<String, dynamic>)['fileUrl']?.toString() ?? '',
      'fileName': f['fileName']?.toString() ?? '',
      'fileId': f['fileId']?.toString() ?? '',
    }).toList(),
  );

  final String id;
  final String visitType;
  final String notes;
  final DateTime? createdAt;
  final String? fileUrl;
  final String? fileName;
  final List<Map<String, String>> files;
}

class Prescription {
  const Prescription({
    required this.id,
    required this.medicineName,
    required this.dosage,
    required this.duration,
    required this.notes,
    required this.createdAt,
    this.startDate,
    this.endDate,
    this.timesDaily,
    this.fileUrl,
    this.fileName,
  });

  factory Prescription.fromJson(Map<String, dynamic> json) => Prescription(
    id: json['_id'] as String,
    medicineName: json['medicineName'] as String,
    dosage: json['dosage'] as String,
    duration: json['duration'] as String,
    notes: json['notes'] as String? ?? '',
    createdAt: DateTime.tryParse(json['createdAt'] as String? ?? ''),
    startDate: DateTime.tryParse(json['startDate'] as String? ?? ''),
    endDate: DateTime.tryParse(json['endDate'] as String? ?? ''),
    timesDaily: json['timesDaily'] as String?,
    fileUrl: json['fileUrl'] as String?,
    fileName: json['fileName'] as String?,
  );

  final String id;
  final String medicineName;
  final String dosage;
  final String duration;
  final String notes;
  final DateTime? createdAt;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? timesDaily;
  final String? fileUrl;
  final String? fileName;
}

class PatientDetail {
  const PatientDetail({
    required this.id,
    required this.patientCode,
    required this.fullName,
    required this.email,
    required this.dateOfBirth,
    required this.gender,
    required this.linkedUserId,
    required this.connectionStatus,
    required this.medicalProfile,
    required this.reports,
    required this.prescriptions,
    required this.medicalRecords,
  });

  factory PatientDetail.fromJson(Map<String, dynamic> json) => PatientDetail(
    id: (json['patient'] as Map<String, dynamic>)['id'] as String,
    patientCode:
        (json['patient'] as Map<String, dynamic>)['patientCode'] as String? ??
        '',
    fullName: (json['patient'] as Map<String, dynamic>)['fullName'] as String,
    email: (json['patient'] as Map<String, dynamic>)['email'] as String? ?? '',
    dateOfBirth: DateTime.tryParse(
      (json['patient'] as Map<String, dynamic>)['dateOfBirth'] as String? ?? '',
    ),
    gender: (json['patient'] as Map<String, dynamic>)['gender'] as String?,
    linkedUserId: (json['patient'] as Map<String, dynamic>)['linkedUserId'] as String?,
    connectionStatus: (json['patient'] as Map<String, dynamic>)['connectionStatus'] as String?,
    medicalProfile: MedicalProfile.fromJson(
      (json['patient'] as Map<String, dynamic>)['medicalProfile']
          as Map<String, dynamic>,
    ),
    reports: (json['reports'] as List<dynamic>)
        .map((r) => VaultFile.fromJson(r as Map<String, dynamic>))
        .toList(),
    prescriptions: (json['prescriptions'] as List<dynamic>)
        .map((p) => Prescription.fromJson(p as Map<String, dynamic>))
        .toList(),
    medicalRecords: (json['medicalRecords'] as List<dynamic>? ?? [])
        .map((r) => MedicalRecord.fromJson(r as Map<String, dynamic>))
        .toList(),
  );

  final String id;
  final String patientCode;
  final String fullName;
  final String email;
  final DateTime? dateOfBirth;
  final String? gender;
  final String? linkedUserId;
  final String? connectionStatus;
  final MedicalProfile medicalProfile;
  final List<VaultFile> reports;
  final List<Prescription> prescriptions;
  final List<MedicalRecord> medicalRecords;
}
