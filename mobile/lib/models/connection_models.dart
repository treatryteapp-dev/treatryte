class PartnerConnection {
  const PartnerConnection({
    required this.id,
    required this.status,
    required this.shareAll,
    required this.sharedFolderIds,
    required this.labName,
    required this.createdAt,
  });

  factory PartnerConnection.fromJson(Map<String, dynamic> json) => PartnerConnection(
        id: json['id'] as String,
        status: json['status'] as String,
        shareAll: json['shareAll'] as bool? ?? false,
        sharedFolderIds: (json['sharedFolderIds'] as List<dynamic>? ?? []).map((f) => f as String).toList(),
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
