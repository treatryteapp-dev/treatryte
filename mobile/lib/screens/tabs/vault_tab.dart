import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/vault_models.dart';
import '../../providers/vault_provider.dart';
import '../../theme/app_theme.dart';

const _categoryOptions = ['cardiology', 'diagnostics', 'prescriptions', 'eye_clinic', 'other'];

const _categoryIcons = {
  'cardiology': Icons.favorite_border,
  'diagnostics': Icons.science_outlined,
  'prescriptions': Icons.medication_outlined,
  'eye_clinic': Icons.remove_red_eye_outlined,
};

String _categoryLabel(String category) {
  return category
      .split('_')
      .map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}')
      .join(' ');
}

class VaultTab extends StatefulWidget {
  const VaultTab({super.key});

  @override
  State<VaultTab> createState() => _VaultTabState();
}

class _VaultTabState extends State<VaultTab> {
  bool _uploading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<VaultProvider>().refresh();
    });
  }

  Future<void> _pickAndUpload() async {
    final category = await showModalBottomSheet<String>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Padding(
              padding: EdgeInsets.all(AppSpacing.md),
              child: Text('Select a category'),
            ),
            for (final option in _categoryOptions)
              ListTile(
                title: Text(_categoryLabel(option)),
                onTap: () => Navigator.of(context).pop(option),
              ),
          ],
        ),
      ),
    );
    if (category == null) return;

    final result = await FilePicker.platform.pickFiles(withData: true);
    final file = result?.files.single;
    if (file?.bytes == null) return;

    setState(() => _uploading = true);
    final success = await context.read<VaultProvider>().uploadFile(
          fileName: file!.name,
          mimeType: _guessMimeType(file.extension),
          bytes: file.bytes as Uint8List,
          category: category,
        );
    if (!mounted) return;
    setState(() => _uploading = false);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(success ? 'Document uploaded successfully.' : 'Upload failed.')),
    );
  }

  String _guessMimeType(String? extension) {
    switch (extension?.toLowerCase()) {
      case 'pdf':
        return 'application/pdf';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      default:
        return 'application/octet-stream';
    }
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final vault = context.watch<VaultProvider>();

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => context.read<VaultProvider>().refresh(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.md,
            AppSpacing.lg,
            AppSpacing.xxl,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Medical Vault', style: textTheme.headlineMedium),
              const SizedBox(height: AppSpacing.md),
              const TextField(
                decoration: InputDecoration(
                  hintText: 'Search medical records, diagnosis...',
                  prefixIcon: Icon(Icons.search),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              _StorageBanner(stats: vault.stats),
              const SizedBox(height: AppSpacing.xl),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Directories', style: textTheme.headlineSmall),
                  TextButton.icon(
                    onPressed: _uploading ? null : _pickAndUpload,
                    icon: _uploading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.upload_file, size: 18),
                    label: Text(_uploading ? 'Uploading…' : 'Scan / Upload'),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              if (vault.isLoading && vault.categories.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: AppSpacing.lg),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (vault.categories.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                  child: Text('No documents yet — upload your first file.', style: textTheme.bodySmall),
                )
              else
                for (final directory in vault.categories)
                  Card(
                    margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.xs,
                      ),
                      leading: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: AppColors.secondaryContainer,
                          borderRadius: BorderRadius.circular(AppRadii.md),
                        ),
                        child: Icon(
                          _categoryIcons[directory.category] ?? Icons.folder_outlined,
                          size: 20,
                          color: AppColors.onSecondaryContainer,
                        ),
                      ),
                      title: Text(
                        _categoryLabel(directory.category),
                        style: textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.onSurface,
                        ),
                      ),
                      subtitle: Text('${directory.count} Files', style: textTheme.bodySmall),
                      trailing: const Icon(Icons.chevron_right, color: AppColors.outline),
                    ),
                  ),
              const SizedBox(height: AppSpacing.lg),
              const _BiometricLockBanner(),
            ],
          ),
        ),
      ),
    );
  }
}

class _StorageBanner extends StatelessWidget {
  const _StorageBanner({required this.stats});

  final VaultStats? stats;

  @override
  Widget build(BuildContext context) {
    final usedBytes = stats?.usedBytes ?? 0;
    final quotaBytes = stats?.quotaBytes ?? 1;
    final fraction = (usedBytes / quotaBytes).clamp(0.0, 1.0);
    final usedGb = (usedBytes / (1024 * 1024 * 1024)).toStringAsFixed(1);
    final quotaGb = (quotaBytes / (1024 * 1024 * 1024)).toStringAsFixed(0);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primaryContainer, AppColors.primary],
        ),
        borderRadius: BorderRadius.circular(AppRadii.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.shield_outlined, color: Colors.white, size: 18),
              const SizedBox(width: AppSpacing.xs),
              const Text(
                'Your Health Vault is Secure',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          const Text(
            'All documents are encrypted with bank-grade AES-256 encryption.',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: AppSpacing.md),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadii.full),
            child: LinearProgressIndicator(
              value: fraction,
              minHeight: 6,
              backgroundColor: Colors.white24,
              valueColor: const AlwaysStoppedAnimation(Colors.white),
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            '$usedGb GB / $quotaGb GB • ${stats?.fileCount ?? 0} Files',
            style: const TextStyle(color: Colors.white70, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _BiometricLockBanner extends StatefulWidget {
  const _BiometricLockBanner();

  @override
  State<_BiometricLockBanner> createState() => _BiometricLockBannerState();
}

class _BiometricLockBannerState extends State<_BiometricLockBanner> {
  bool _enabled = false;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.secondaryContainer,
                borderRadius: BorderRadius.circular(AppRadii.md),
              ),
              child: const Icon(Icons.fingerprint,
                  color: AppColors.onSecondaryContainer),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Enable Biometric Lock',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          )),
                  Text(
                    'Add an extra layer of protection to your vault.',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            Switch(
              value: _enabled,
              activeThumbColor: AppColors.primary,
              onChanged: (value) async {
                setState(() => _enabled = value);
                await context.read<VaultProvider>().setBiometricLock(value);
              },
            ),
          ],
        ),
      ),
    );
  }
}
