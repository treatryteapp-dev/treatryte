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
        services: (json['services'] as List<dynamic>? ?? []).map((s) => s as String).toList(),
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
