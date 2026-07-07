class TimeSlot {
  const TimeSlot({required this.time, required this.available});

  factory TimeSlot.fromJson(Map<String, dynamic> json) => TimeSlot(
    time: json['time'] as String,
    available: json['available'] as bool,
  );

  final String time;
  final bool available;
}

class Availability {
  const Availability({required this.days, required this.serviceFeeKobo});

  factory Availability.fromJson(Map<String, dynamic> json) => Availability(
    days: (json['days'] as List<dynamic>)
        .map((d) => AvailabilityDay.fromJson(d as Map<String, dynamic>))
        .toList(),
    serviceFeeKobo: json['serviceFeeKobo'] as int,
  );

  final List<AvailabilityDay> days;
  final int serviceFeeKobo;
}

class AvailabilityDay {
  const AvailabilityDay({required this.date, required this.slots});

  factory AvailabilityDay.fromJson(Map<String, dynamic> json) =>
      AvailabilityDay(
        date: DateTime.parse(json['date'] as String),
        slots: (json['slots'] as List<dynamic>)
            .map((s) => TimeSlot.fromJson(s as Map<String, dynamic>))
            .toList(),
      );

  final DateTime date;
  final List<TimeSlot> slots;
}

class AppointmentItem {
  const AppointmentItem({required this.name, required this.priceKobo});

  factory AppointmentItem.fromJson(Map<String, dynamic> json) =>
      AppointmentItem(
        name: json['name'] as String,
        priceKobo: json['price'] as int,
      );

  final String name;
  final int priceKobo;
}

class Appointment {
  const Appointment({
    required this.id,
    required this.status,
    required this.subtotalKobo,
    required this.serviceFeeKobo,
    required this.totalKobo,
    this.patientId,
    this.patientName,
    this.serviceType,
    this.scheduledDate,
    this.scheduledTimeSlot,
    this.createdAt,
    this.labId,
    this.labName,
    this.items = const [],
  });

  factory Appointment.fromJson(Map<String, dynamic> json) => Appointment(
    id: json['_id'] as String,
    status: json['status'] as String,
    subtotalKobo: json['subtotal'] as int,
    serviceFeeKobo: json['serviceFee'] as int,
    totalKobo: json['total'] as int,
    patientId: json['userId'] as String?,
    patientName: json['patientName'] as String?,
    serviceType: json['serviceType'] as String?,
    scheduledDate: json['scheduledDate'] as String?,
    scheduledTimeSlot: json['scheduledTimeSlot'] as String?,
    createdAt: json['createdAt'] != null
        ? DateTime.tryParse(json['createdAt'] as String)
        : null,
    labId: json['labId'] as String?,
    labName: json['labName'] as String?,
    items: json['items'] != null
        ? (json['items'] as List<dynamic>)
              .map((i) => AppointmentItem.fromJson(i as Map<String, dynamic>))
              .toList()
        : const [],
  );

  final String id;
  final String status;
  final int subtotalKobo;
  final int serviceFeeKobo;
  final int totalKobo;
  // Provider-side (partner appointments tab) fields only - null on the
  // patient-side booking flow's response shape.
  final String? patientId;
  final String? patientName;
  final String? serviceType;
  final String? scheduledDate;
  final String? scheduledTimeSlot;
  final DateTime? createdAt;
  // Patient-side "My Appointments" list fields.
  final String? labId;
  final String? labName;
  final List<AppointmentItem> items;
}
