class AppUser {
  const AppUser({
    required this.id,
    required this.fullName,
    required this.email,
    required this.role,
    required this.biometricLockEnabled,
    this.planId,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
        id: json['id'] as String,
        fullName: json['fullName'] as String,
        email: json['email'] as String,
        role: json['role'] as String,
        biometricLockEnabled: json['biometricLockEnabled'] as bool? ?? false,
        planId: json['planId'] as String?,
      );

  final String id;
  final String fullName;
  final String email;
  final String role;
  final bool biometricLockEnabled;
  final String? planId;

  String get firstName => fullName.split(' ').first;
}
