class PartnerLab {
  const PartnerLab({
    required this.id,
    required this.name,
    required this.licenseNumber,
    required this.address,
    required this.services,
    required this.status,
    this.rejectionReason,
  });

  factory PartnerLab.fromJson(Map<String, dynamic> json) => PartnerLab(
    id: json['_id'] as String,
    name: json['name'] as String,
    licenseNumber: json['licenseNumber'] as String? ?? '',
    address: json['address'] as String? ?? '',
    services: (json['services'] as List<dynamic>? ?? [])
        .map((s) => s as String)
        .toList(),
    status: json['status'] as String? ?? 'pending',
    rejectionReason: json['rejectionReason'] as String?,
  );

  final String id;
  final String name;
  final String licenseNumber;
  final String address;
  final List<String> services;
  final String status; // pending | approved | rejected
  final String? rejectionReason;
}

class PartnerService {
  const PartnerService({
    required this.id,
    required this.name,
    required this.priceKobo,
    required this.category,
  });

  factory PartnerService.fromJson(Map<String, dynamic> json) => PartnerService(
    id: json['_id'] as String,
    name: json['name'] as String,
    priceKobo: json['price'] as int,
    category: json['category'] as String,
  );

  final String id;
  final String name;
  final int priceKobo;
  final String category;
}

class PatientFeedbackLog {
  const PatientFeedbackLog({
    required this.id,
    required this.mood,
    this.note,
    required this.createdAt,
  });

  factory PatientFeedbackLog.fromJson(Map<String, dynamic> json) => PatientFeedbackLog(
    id: json['_id'] as String,
    mood: json['mood'] as String,
    note: json['note'] as String?,
    createdAt: DateTime.parse(json['createdAt'] as String),
  );

  final String id;
  final String mood;
  final String? note;
  final DateTime createdAt;
}

class PatientFeedbackGroup {
  const PatientFeedbackGroup({
    required this.patientId,
    required this.patientName,
    required this.logs,
  });

  factory PatientFeedbackGroup.fromJson(Map<String, dynamic> json) => PatientFeedbackGroup(
    patientId: json['patientId'] as String,
    patientName: json['patientName'] as String,
    logs: (json['logs'] as List<dynamic>)
        .map((l) => PatientFeedbackLog.fromJson(l as Map<String, dynamic>))
        .toList(),
  );

  final String patientId;
  final String patientName;
  final List<PatientFeedbackLog> logs;
}
