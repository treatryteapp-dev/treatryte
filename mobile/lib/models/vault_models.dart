class VaultCategory {
  const VaultCategory({required this.category, required this.count});

  factory VaultCategory.fromJson(Map<String, dynamic> json) => VaultCategory(
    category: json['category'] as String,
    count: json['count'] as int,
  );

  final String category;
  final int count;
}

class VaultStats {
  const VaultStats({
    required this.usedBytes,
    required this.quotaBytes,
    required this.fileCount,
    required this.folderCount,
    required this.maxVaultFolders,
    required this.maxVaultFiles,
  });

  factory VaultStats.fromJson(Map<String, dynamic> json) => VaultStats(
    usedBytes: json['usedBytes'] as int,
    quotaBytes: json['quotaBytes'] as int,
    fileCount: json['fileCount'] as int,
    folderCount: json['folderCount'] as int? ?? 0,
    maxVaultFolders: json['maxVaultFolders'] as int?,
    maxVaultFiles: json['maxVaultFiles'] as int?,
  );

  final int usedBytes;
  final int quotaBytes;
  final int fileCount;
  final int folderCount;
  // null means unlimited.
  final int? maxVaultFolders;
  final int? maxVaultFiles;
}

class VaultFolder {
  const VaultFolder({
    required this.id,
    required this.name,
    required this.fileCount,
  });

  factory VaultFolder.fromJson(Map<String, dynamic> json) => VaultFolder(
    id: json['_id'] as String,
    name: json['name'] as String,
    fileCount: json['fileCount'] as int? ?? 0,
  );

  final String id;
  final String name;
  final int fileCount;
}

class VaultFile {
  const VaultFile({
    required this.id,
    required this.fileName,
    required this.category,
    required this.status,
    this.url,
  });

  factory VaultFile.fromJson(Map<String, dynamic> json) => VaultFile(
    id: json['_id'] as String,
    fileName: json['fileName'] as String,
    category: json['category'] as String,
    status: json['status'] as String,
    url: json['url'] as String?,
  );

  final String id;
  final String fileName;
  final String category;
  final String status;
  final String? url;
}
