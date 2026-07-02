class AppUser {
  const AppUser({
    required this.id,
    required this.fullName,
    required this.email,
    required this.role,
    required this.biometricLockEnabled,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
        id: json['id'] as String,
        fullName: json['fullName'] as String,
        email: json['email'] as String,
        role: json['role'] as String,
        biometricLockEnabled: json['biometricLockEnabled'] as bool? ?? false,
      );

  final String id;
  final String fullName;
  final String email;
  final String role;
  final bool biometricLockEnabled;

  String get firstName => fullName.split(' ').first;
}
