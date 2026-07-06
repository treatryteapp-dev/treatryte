class AppUser {
  const AppUser({
    required this.id,
    required this.fullName,
    required this.email,
    required this.role,
    this.planId,
    this.avatarUrl,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
    id: json['id'] as String,
    fullName: json['fullName'] as String,
    email: json['email'] as String,
    role: json['role'] as String,
    planId: json['planId'] as String?,
    avatarUrl: json['avatarUrl'] as String?,
  );

  final String id;
  final String fullName;
  final String email;
  final String role;
  final String? planId;
  final String? avatarUrl;

  String get firstName => fullName.split(' ').first;
}
