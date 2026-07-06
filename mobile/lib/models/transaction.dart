class WalletTransaction {
  const WalletTransaction({
    required this.id,
    required this.type,
    required this.category,
    required this.amountKobo,
    required this.status,
    required this.description,
    required this.createdAt,
  });

  factory WalletTransaction.fromJson(Map<String, dynamic> json) =>
      WalletTransaction(
        id: json['_id'] as String,
        type: json['type'] as String,
        category: json['category'] as String,
        amountKobo: json['amount'] as int,
        status: json['status'] as String,
        description: json['description'] as String? ?? '',
        createdAt: DateTime.parse(json['createdAt'] as String),
      );

  final String id;
  final String type;
  final String category;
  final int amountKobo;
  final String status;
  final String description;
  final DateTime createdAt;
}
