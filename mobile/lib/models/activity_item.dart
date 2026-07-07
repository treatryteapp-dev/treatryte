class ActivityItem {
  const ActivityItem({
    required this.id,
    required this.type,
    required this.title,
    required this.subtitle,
    required this.iconKey,
    required this.createdAt,
    this.refCollection,
    this.refId,
  });

  factory ActivityItem.fromJson(Map<String, dynamic> json) => ActivityItem(
    id: json['_id'] as String,
    type: json['type'] as String,
    title: json['title'] as String,
    subtitle: json['subtitle'] as String? ?? '',
    iconKey: json['iconKey'] as String? ?? '',
    createdAt: DateTime.parse(json['createdAt'] as String),
    refCollection: json['refCollection'] as String?,
    refId: json['refId'] as String?,
  );

  final String id;
  final String type;
  final String title;
  final String subtitle;
  final String iconKey;
  final DateTime createdAt;
  // Set for activity types that link back to a specific record (e.g. the
  // vault file a "Document Uploaded" activity is about) - null for types
  // that only summarize (e.g. wallet funding).
  final String? refCollection;
  final String? refId;
}
