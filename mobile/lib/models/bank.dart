class Bank {
  const Bank({required this.code, required this.name});

  factory Bank.fromJson(Map<String, dynamic> json) =>
      Bank(code: json['code'] as String, name: json['name'] as String);

  final String code;
  final String name;
}
