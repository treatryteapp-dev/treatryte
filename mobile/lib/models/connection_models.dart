import 'patient_models.dart';
import 'vault_models.dart';

class PartnerConnection {
  const PartnerConnection({
    required this.id,
    required this.status,
    required this.shareAll,
    required this.sharedFolderIds,
    required this.labName,
    required this.createdAt,
  });

  factory PartnerConnection.fromJson(Map<String, dynamic> json) =>
      PartnerConnection(
        id: json['id'] as String,
        status: json['status'] as String,
        shareAll: json['shareAll'] as bool? ?? false,
        sharedFolderIds: (json['sharedFolderIds'] as List<dynamic>? ?? [])
            .map((f) => f as String)
            .toList(),
        labName: json['labName'] as String,
        createdAt: DateTime.tryParse(json['createdAt'] as String? ?? ''),
      );

  final String id;
  final String status; // pending | accepted | declined
  final bool shareAll;
  final List<String> sharedFolderIds;
  final String labName;
  final DateTime? createdAt;
}

class ConnectionDetail {
  const ConnectionDetail({
    required this.connection,
    required this.medicalRecords,
    required this.prescriptions,
    required this.reports,
  });

  factory ConnectionDetail.fromJson(Map<String, dynamic> json) =>
      ConnectionDetail(
        connection: PartnerConnection.fromJson(
          json['connection'] as Map<String, dynamic>,
        ),
        medicalRecords: (json['medicalRecords'] as List<dynamic>? ?? [])
            .map((r) => MedicalRecord.fromJson(r as Map<String, dynamic>))
            .toList(),
        prescriptions: (json['prescriptions'] as List<dynamic>? ?? [])
            .map((r) => Prescription.fromJson(r as Map<String, dynamic>))
            .toList(),
        reports: (json['reports'] as List<dynamic>? ?? [])
            .map((r) => VaultFile.fromJson(r as Map<String, dynamic>))
            .toList(),
      );

  final PartnerConnection connection;
  final List<MedicalRecord> medicalRecords;
  final List<Prescription> prescriptions;
  final List<VaultFile> reports;
}
