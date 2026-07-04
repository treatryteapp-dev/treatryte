class Plan {
  const Plan({
    required this.id,
    required this.name,
    required this.price,
    required this.interval,
    required this.type,
    required this.features,
    required this.excludedFeatures,
    required this.transactionSplit,
  });

  factory Plan.fromJson(Map<String, dynamic> json) => Plan(
        id: json['_id'] as String,
        name: json['name'] as String,
        price: (json['price'] as num).toDouble(),
        interval: json['interval'] as String? ?? 'monthly',
        type: json['type'] as String? ?? 'Individual',
        features: (json['features'] as List<dynamic>? ?? []).map((f) => f as String).toList(),
        excludedFeatures: (json['excludedFeatures'] as List<dynamic>? ?? []).map((f) => f as String).toList(),
        transactionSplit: (json['transactionSplit'] as num?)?.toDouble() ?? 0,
      );

  final String id;
  final String name;
  final double price;
  final String interval;
  final String type;
  final List<String> features;
  final List<String> excludedFeatures;
  final double transactionSplit;
}
