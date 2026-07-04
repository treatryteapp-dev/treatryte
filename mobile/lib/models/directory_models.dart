class LabTest {
  const LabTest({required this.id, required this.name, this.priceKobo, this.duration});

  factory LabTest.fromJson(Map<String, dynamic> json) => LabTest(
        id: json['_id'] as String,
        name: json['name'] as String,
        priceKobo: json['price'] as int?,
        duration: json['duration'] as String?,
      );

  final String id;
  final String name;
  final int? priceKobo;
  final String? duration;
}

class Lab {
  const Lab({
    required this.id,
    required this.name,
    required this.distanceKm,
    required this.address,
    required this.hours,
    required this.rating,
    required this.reviewCount,
    required this.tests,
  });

  // distanceKm/hours/reviewCount only exist on old demo-seeded labs (no
  // geolocation/reviews feature exists yet) - real signed-up-and-approved
  // partners won't have them, so these must tolerate being absent.
  factory Lab.fromJson(Map<String, dynamic> json) => Lab(
        id: json['_id'] as String,
        name: json['name'] as String,
        distanceKm: (json['distanceKm'] as num?)?.toDouble() ?? 0.0,
        address: json['address'] as String? ?? '',
        hours: json['hours'] as String? ?? 'Hours not provided',
        rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
        reviewCount: json['reviewCount'] as int? ?? 0,
        tests: (json['tests'] as List<dynamic>? ?? [])
            .map((t) => LabTest.fromJson(t as Map<String, dynamic>))
            .toList(),
      );

  final String id;
  final String name;
  final double distanceKm;
  final String address;
  final String hours;
  final double rating;
  final int reviewCount;
  final List<LabTest> tests;
}

class Clinic {
  const Clinic({
    required this.id,
    required this.name,
    required this.type,
    required this.distanceKm,
    required this.address,
    required this.hours,
  });

  factory Clinic.fromJson(Map<String, dynamic> json) => Clinic(
        id: json['_id'] as String,
        name: json['name'] as String,
        type: json['type'] as String,
        distanceKm: (json['distanceKm'] as num).toDouble(),
        address: json['address'] as String,
        hours: json['hours'] as String,
      );

  final String id;
  final String name;
  final String type;
  final double distanceKm;
  final String address;
  final String hours;
}
