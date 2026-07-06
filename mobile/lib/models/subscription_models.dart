class Subscription {
  const Subscription({
    required this.id,
    required this.planId,
    required this.status,
    required this.currentPeriodEnd,
    required this.cancelAtPeriodEnd,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) => Subscription(
        id: json['_id'] as String,
        planId: json['planId'] as String,
        status: json['status'] as String,
        currentPeriodEnd:
            json['currentPeriodEnd'] != null ? DateTime.tryParse(json['currentPeriodEnd'] as String) : null,
        cancelAtPeriodEnd: json['cancelAtPeriodEnd'] as bool? ?? false,
      );

  final String id;
  final String planId;
  final String status;
  final DateTime? currentPeriodEnd;
  final bool cancelAtPeriodEnd;
}

class UpgradeResult {
  const UpgradeResult({required this.requiresPayment, this.checkoutLink});

  factory UpgradeResult.fromJson(Map<String, dynamic> json) => UpgradeResult(
        requiresPayment: json['requiresPayment'] as bool? ?? false,
        checkoutLink: json['checkoutLink'] as String?,
      );

  final bool requiresPayment;
  final String? checkoutLink;
}
