class DoseScheduleItem {
  const DoseScheduleItem({
    required this.doseLogId,
    required this.medicationName,
    required this.dosage,
    required this.scheduledFor,
    required this.status,
  });

  factory DoseScheduleItem.fromJson(Map<String, dynamic> json) =>
      DoseScheduleItem(
        doseLogId: json['doseLogId'] as String,
        medicationName: json['medicationName'] as String? ?? '',
        dosage: json['dosage'] as String? ?? '',
        scheduledFor: DateTime.parse(json['scheduledFor'] as String),
        status: json['status'] as String,
      );

  final String doseLogId;
  final String medicationName;
  final String dosage;
  final DateTime scheduledFor;
  final String status;

  bool get taken => status == 'taken';
}
