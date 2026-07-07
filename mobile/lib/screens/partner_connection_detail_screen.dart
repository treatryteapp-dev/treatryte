import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/connection_models.dart';
import '../providers/connection_provider.dart';
import '../providers/vault_provider.dart';
import '../theme/app_theme.dart';

class PartnerConnectionDetailScreen extends StatefulWidget {
  const PartnerConnectionDetailScreen({
    super.key,
    required this.connectionId,
    required this.initialConnection,
  });

  final String connectionId;
  final PartnerConnection initialConnection;

  @override
  State<PartnerConnectionDetailScreen> createState() =>
      _PartnerConnectionDetailScreenState();
}

class _PartnerConnectionDetailScreenState
    extends State<PartnerConnectionDetailScreen> {
  ConnectionDetail? _detail;
  bool _isLoading = true;
  String? _error;

  bool _shareAll = true;
  Set<String> _selectedFolderIds = {};
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _shareAll = widget.initialConnection.shareAll;
    _selectedFolderIds = widget.initialConnection.sharedFolderIds.toSet();
    _fetchDetail();
  }

  Future<void> _fetchDetail() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final detail = await context.read<ConnectionProvider>().getDetail(
      widget.connectionId,
    );

    if (!mounted) return;

    setState(() {
      _isLoading = false;
      if (detail == null) {
        _error =
            context.read<ConnectionProvider>().errorMessage ??
            'Failed to load details.';
      } else {
        _detail = detail;
        _shareAll = detail.connection.shareAll;
        _selectedFolderIds = detail.connection.sharedFolderIds.toSet();
      }
    });
  }

  Future<void> _saveAccessControl() async {
    setState(() => _isSaving = true);

    final ok = await context.read<ConnectionProvider>().updateAccess(
      widget.connectionId,
      shareAll: _shareAll,
      folderIds: _shareAll ? null : _selectedFolderIds.toList(),
    );

    if (!mounted) return;

    setState(() => _isSaving = false);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          ok ? 'Access settings updated.' : 'Failed to update access settings.',
        ),
      ),
    );
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '';
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0 && now.day == date.day) {
      return 'Today at ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    } else if (difference.inDays == 1 ||
        (difference.inDays == 0 && now.day != date.day)) {
      return 'Yesterday at ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    }

    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final vault = context.watch<VaultProvider>();

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text(widget.initialConnection.labName),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
            ? Center(
                child: Text(
                  _error!,
                  style: const TextStyle(color: AppColors.error),
                ),
              )
            : RefreshIndicator(
                onRefresh: _fetchDetail,
                child: ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  children: [
                    _buildAccessControlSection(textTheme, vault),
                    const SizedBox(height: AppSpacing.xxl),
                    _buildSharedReportsSection(textTheme),
                    const SizedBox(height: AppSpacing.xxl),
                    _buildMedicalRecordsSection(textTheme),
                    const SizedBox(height: AppSpacing.xxl),
                    _buildPrescriptionsSection(textTheme),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildAccessControlSection(TextTheme textTheme, VaultProvider vault) {
    final sharedFolderIdsSet = _detail!.connection.sharedFolderIds.toSet();
    final hasChanges = _shareAll != _detail!.connection.shareAll ||
        !_selectedFolderIds.containsAll(sharedFolderIdsSet) ||
        !sharedFolderIdsSet.containsAll(_selectedFolderIds);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Access Control',
              style: textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            if (hasChanges)
              SizedBox(
                height: 32,
                child: FilledButton(
                  onPressed: _isSaving ? null : _saveAccessControl,
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                    ),
                    textStyle: textTheme.labelMedium,
                  ),
                  child: _isSaving
                      ? const SizedBox(
                          width: 12,
                          height: 12,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Save'),
                ),
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'Choose what this partner can see from your Health Vault.',
          style: textTheme.bodySmall,
        ),
        const SizedBox(height: AppSpacing.md),
        Card(
          child: Column(
            children: [
              RadioListTile<bool>(
                value: true,
                groupValue: _shareAll,
                onChanged: (v) => setState(() => _shareAll = v ?? true),
                title: const Text('Share all folders'),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                ),
              ),
              const Divider(height: 1),
              RadioListTile<bool>(
                value: false,
                groupValue: _shareAll,
                onChanged: (v) => setState(() => _shareAll = v ?? false),
                title: const Text('Choose specific folders'),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                ),
              ),
              if (!_shareAll) ...[
                const Divider(height: 1),
                if (vault.folders.isEmpty)
                  Padding(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    child: Text(
                      'You have no folders yet.',
                      style: textTheme.bodySmall,
                    ),
                  )
                else
                  for (final folder in vault.folders)
                    CheckboxListTile(
                      value: _selectedFolderIds.contains(folder.id),
                      onChanged: (checked) => setState(() {
                        if (checked == true) {
                          _selectedFolderIds.add(folder.id);
                        } else {
                          _selectedFolderIds.remove(folder.id);
                        }
                      }),
                      title: Text(folder.name),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                      ),
                      controlAffinity: ListTileControlAffinity.leading,
                    ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMedicalRecordsSection(TextTheme textTheme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Medical Records',
          style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: AppSpacing.sm),
        if (_detail!.medicalRecords.isEmpty)
          Text(
            'No medical records issued by this partner.',
            style: textTheme.bodySmall,
          )
        else
          for (final record in _detail!.medicalRecords)
            Card(
              margin: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.description_outlined,
                          size: 16,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Text(
                          record.visitType,
                          style: textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    if (record.notes.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.sm),
                      Text(record.notes, style: textTheme.bodySmall),
                    ],
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      _formatDate(record.createdAt),
                      style: textTheme.labelSmall?.copyWith(
                        color: AppColors.outline,
                      ),
                    ),
                  ],
                ),
              ),
            ),
      ],
    );
  }

  Widget _buildPrescriptionsSection(TextTheme textTheme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Prescriptions',
          style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: AppSpacing.sm),
        if (_detail!.prescriptions.isEmpty)
          Text(
            'No prescriptions issued by this partner.',
            style: textTheme.bodySmall,
          )
        else
          for (final prescription in _detail!.prescriptions)
            Card(
              margin: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.medication_outlined,
                          size: 16,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Text(
                          prescription.medicineName,
                          style: textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      '${prescription.dosage} • ${prescription.duration}',
                      style: textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    if (prescription.notes.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.sm),
                      Text(prescription.notes, style: textTheme.bodySmall),
                    ],
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      _formatDate(prescription.createdAt),
                      style: textTheme.labelSmall?.copyWith(
                        color: AppColors.outline,
                      ),
                    ),
                  ],
                ),
              ),
            ),
      ],
    );
  }

  Widget _buildSharedReportsSection(TextTheme textTheme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Shared Reports (${_detail!.reports.length})',
          style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: AppSpacing.md),
        if (_detail!.reports.isEmpty)
          Text(
            'No reports shared in this connection.',
            style: textTheme.bodyMedium?.copyWith(color: AppColors.outline),
          )
        else
          for (final report in _detail!.reports)
            Card(
              margin: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: ListTile(
                onTap: () async {
                  if (report.url != null && report.url!.isNotEmpty) {
                    final uri = Uri.parse(report.url!);
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    } else {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not open file.')));
                      }
                    }
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('File preview not available.')));
                  }
                },
                leading: Icon(
                  report.fileName.toLowerCase().endsWith('.pdf') ? Icons.picture_as_pdf : Icons.image,
                  color: AppColors.primary,
                ),
                title: Text(report.fileName, maxLines: 1, overflow: TextOverflow.ellipsis),
                subtitle: Text(
                  report.uploadedBy ?? 'Patient Uploaded',
                  style: TextStyle(
                    fontSize: 12,
                    color: report.sourceType == 'partner' || (report.uploadedBy != null && report.uploadedBy != 'Patient Uploaded')
                        ? AppColors.primary
                        : AppColors.textSecondary,
                    fontWeight: report.sourceType == 'partner' || (report.uploadedBy != null && report.uploadedBy != 'Patient Uploaded')
                        ? FontWeight.w600
                        : FontWeight.normal,
                  ),
                ),
                trailing: const Icon(Icons.open_in_new, size: 16, color: AppColors.textSecondary),
              ),
            ),
      ],
    );
  }
}
