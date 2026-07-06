import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../providers/partner_provider.dart';
import '../providers/vault_provider.dart';
import '../theme/app_theme.dart';

/// Shown instead of the partner dashboard when a provider's lab is not yet
/// approved - previously there was no such gate at all, so any authenticated
/// provider (pending or rejected) got full dashboard access.
///
/// A rejected partner gets a dedicated re-upload section here (rather than
/// just an informational message) so they can act on the rejection reason
/// and resubmit for review without contacting support.
class PartnerStatusScreen extends StatefulWidget {
  const PartnerStatusScreen({
    super.key,
    required this.status,
    this.rejectionReason,
    this.onRetry,
  });

  /// 'pending' or 'rejected'.
  final String status;
  final String? rejectionReason;
  final VoidCallback? onRetry;

  @override
  State<PartnerStatusScreen> createState() => _PartnerStatusScreenState();
}

class _PartnerStatusScreenState extends State<PartnerStatusScreen> {
  final List<PlatformFile> _pickedFiles = [];
  bool _resubmitting = false;

  bool get _isRejected => widget.status == 'rejected';

  Future<void> _pickFiles() async {
    final result = await FilePicker.platform.pickFiles(
      withData: true,
      allowMultiple: true,
    );
    if (result == null) return;
    setState(() {
      _pickedFiles.addAll(result.files.where((f) => f.bytes != null));
    });
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

  Future<void> _resubmit() async {
    if (_pickedFiles.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Add at least one document before resubmitting.'),
        ),
      );
      return;
    }

    setState(() => _resubmitting = true);

    final vault = context.read<VaultProvider>();
    var uploadFailures = 0;
    for (final file in _pickedFiles) {
      try {
        final uploaded = await vault.uploadFile(
          fileName: file.name,
          mimeType: _guessMimeType(file.extension),
          bytes: file.bytes as Uint8List,
          category: 'partner_verification',
        );
        if (!uploaded) uploadFailures++;
      } catch (_) {
        uploadFailures++;
      }
    }

    if (!mounted) return;
    if (uploadFailures > 0) {
      setState(() => _resubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '$uploadFailures document(s) failed to upload. Please try again.',
          ),
        ),
      );
      return;
    }

    final ok = await context.read<PartnerProvider>().resubmit();
    if (!mounted) return;
    setState(() => _resubmitting = false);

    if (ok) {
      setState(() => _pickedFiles.clear());
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Application resubmitted - our team will review it shortly.',
          ),
        ),
      );
    } else {
      final error = context.read<PartnerProvider>().errorMessage;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error ?? 'Failed to resubmit application')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: AppSpacing.xl),
              Center(
                child: Container(
                  width: 88,
                  height: 88,
                  decoration: BoxDecoration(
                    color:
                        (_isRejected
                                ? AppColors.error
                                : AppColors.secondaryContainer)
                            .withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _isRejected
                        ? Icons.cancel_outlined
                        : Icons.hourglass_top_rounded,
                    color: _isRejected ? AppColors.error : AppColors.secondary,
                    size: 40,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              Text(
                _isRejected
                    ? 'Application Not Approved'
                    : 'Application Under Review',
                style: textTheme.headlineMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                _isRejected
                    ? 'Review the reason below, then upload updated documents to resubmit for another review.'
                    : 'Your credentials are still being reviewed by our clinical review team. This usually takes 24 to 48 hours - check back soon.',
                style: textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              if (_isRejected) ...[
                const SizedBox(height: AppSpacing.lg),
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.errorContainer.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(AppRadii.md),
                    border: Border.all(
                      color: AppColors.error.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Reason',
                        style: textTheme.labelSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.error,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.rejectionReason?.trim().isNotEmpty == true
                            ? widget.rejectionReason!
                            : 'No specific reason was provided - your submitted documents could not be verified as-is.',
                        style: textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Re-upload Verification Documents',
                    style: textTheme.headlineSmall,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                OutlinedButton.icon(
                  onPressed: _pickFiles,
                  icon: const Icon(Icons.cloud_upload_outlined),
                  label: const Text('Select Documents'),
                ),
                if (_pickedFiles.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.md),
                  for (var i = 0; i < _pickedFiles.length; i++)
                    Card(
                      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                      child: ListTile(
                        leading: Icon(
                          _pickedFiles[i].name.toLowerCase().endsWith('.pdf')
                              ? Icons.description
                              : Icons.image,
                          color: AppColors.onSurfaceVariant,
                        ),
                        title: Text(
                          _pickedFiles[i].name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        subtitle: Text(
                          '${(_pickedFiles[i].size / 1024).toStringAsFixed(0)} KB',
                        ),
                        trailing: IconButton(
                          icon: const Icon(
                            Icons.delete_outline,
                            color: AppColors.error,
                          ),
                          onPressed: () =>
                              setState(() => _pickedFiles.removeAt(i)),
                        ),
                      ),
                    ),
                ],
                const SizedBox(height: AppSpacing.md),
                ElevatedButton(
                  onPressed: _resubmitting ? null : _resubmit,
                  child: _resubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Resubmit Application'),
                ),
              ],
              const SizedBox(height: AppSpacing.xl),
              if (!_isRejected && widget.onRetry != null) ...[
                OutlinedButton(
                  onPressed: widget.onRetry,
                  child: const Text('Check Again'),
                ),
                const SizedBox(height: AppSpacing.md),
              ],
              OutlinedButton(
                onPressed: () async {
                  await context.read<AuthProvider>().logout();
                  if (context.mounted) context.go('/login');
                },
                child: const Text('Log Out'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
