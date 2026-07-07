import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/patient_models.dart';
import '../providers/partner_provider.dart';
import '../theme/app_theme.dart';

class _MedicalRecordForm {
  String selectedVisitType = 'General Consultation';
  final notesCtrl = TextEditingController();
  bool isUploading = false;
  String? attachedFileName;
  String? attachedFileUrl;
  String? attachedFileId;
}

class _PrescriptionDrugForm {
  final medicineCtrl = TextEditingController();
  final dosageCtrl = TextEditingController();
  final notesCtrl = TextEditingController();
  DateTime? startDate = DateTime.now();
  DateTime? endDate;
  String timesDaily = '1 time daily';
  String? fileName;
  String? fileUrl;
  String? fileId;
  bool isUploading = false;
}

class PartnerPatientDetailScreen extends StatefulWidget {
  const PartnerPatientDetailScreen({super.key, required this.patientId});
  
  final String patientId;

  @override
  State<PartnerPatientDetailScreen> createState() => _PartnerPatientDetailScreenState();
}

class _PartnerPatientDetailScreenState extends State<PartnerPatientDetailScreen> {

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<PartnerProvider>().loadPatientDetail(widget.patientId);
    });
  }

  Future<void> _showIssueRecordSheet(PartnerPatient patient) async {
    final records = <_MedicalRecordForm>[_MedicalRecordForm()];
    const visitTypes = [
      'General Consultation',
      'Follow-up Visit',
      'Lab Results Review',
      'Specialist Referral',
      'Telehealth',
      'Emergency',
    ];
    final partner = context.read<PartnerProvider>();

    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        bool isSubmitting = false;
        return StatefulBuilder(
          builder: (ctx, setSheetState) => Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(ctx).viewInsets.bottom,
            ),
            child: Container(
              height: MediaQuery.of(ctx).size.height * 0.85,
              decoration: const BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.vertical(
                  top: Radius.circular(AppRadii.xl),
                ),
              ),
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, AppSpacing.sm),
                    child: Row(
                      children: [
                        const Icon(Icons.assignment_outlined, color: AppColors.primary),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Text(
                            'Add Medical Records — ${patient.fullName}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.of(ctx).pop(),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  Expanded(
                    child: ListView.separated(
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      itemCount: records.length,
                      separatorBuilder: (c, i) => const Padding(
                        padding: EdgeInsets.symmetric(vertical: AppSpacing.lg),
                        child: Divider(),
                      ),
                      itemBuilder: (ctx, i) {
                        final record = records[i];
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Record #${i + 1}',
                                  style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
                                ),
                                if (records.length > 1)
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline, color: AppColors.error),
                                    onPressed: () => setSheetState(() => records.removeAt(i)),
                                    tooltip: 'Remove Record',
                                  ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.sm),
                            InputDecorator(
                              decoration: const InputDecoration(labelText: 'Visit Type'),
                              child: DropdownButton<String>(
                                value: record.selectedVisitType,
                                underline: const SizedBox.shrink(),
                                isExpanded: true,
                                items: visitTypes
                                    .map((t) => DropdownMenuItem<String>(value: t, child: Text(t)))
                                    .toList(),
                                onChanged: (val) => setSheetState(() => record.selectedVisitType = val ?? record.selectedVisitType),
                              ),
                            ),
                            const SizedBox(height: AppSpacing.sm),
                            TextField(
                              controller: record.notesCtrl,
                              maxLines: 3,
                              decoration: const InputDecoration(labelText: 'Clinical Notes', alignLabelWithHint: true),
                            ),
                            const SizedBox(height: AppSpacing.sm),
                            OutlinedButton.icon(
                              icon: record.isUploading
                                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                                  : Icon(
                                      record.attachedFileName != null ? Icons.check_circle : Icons.upload_file,
                                      size: 18,
                                      color: record.attachedFileName != null ? AppColors.primary : null,
                                    ),
                              label: Text(
                                record.attachedFileName != null ? 'Attached: ${record.attachedFileName}' : 'Attach Medical Record / Document',
                              ),
                              onPressed: record.isUploading
                                  ? null
                                  : () async {
                                      final result = await FilePicker.platform.pickFiles(withData: true);
                                      final file = result?.files.single;
                                      if (file?.bytes != null) {
                                        setSheetState(() => record.isUploading = true);
                                        try {
                                          final res = await partner.uploadPatientFile(
                                            patient.id,
                                            fileName: file!.name,
                                            mimeType: 'application/octet-stream',
                                            bytes: file.bytes as Uint8List,
                                            category: 'Medical Reports',
                                          );
                                          if (res != null) {
                                            setSheetState(() {
                                              record.attachedFileId = res['fileId'];
                                              record.attachedFileName = res['fileName'];
                                              record.attachedFileUrl = res['fileUrl'];
                                            });
                                          }
                                        } finally {
                                          setSheetState(() => record.isUploading = false);
                                        }
                                      }
                                    },
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Column(
                      children: [
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.add, size: 18),
                            label: const Text('Add Another Record'),
                            onPressed: () => setSheetState(() => records.add(_MedicalRecordForm())),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton.icon(
                            icon: const Icon(Icons.save_outlined, size: 18),
                            onPressed: isSubmitting || records.any((r) => r.isUploading)
                                ? null
                                : () async {
                                    setSheetState(() => isSubmitting = true);
                                    try {
                                      final ok = await partner.issueMedicalRecords(
                                        patient.id,
                                        records: records.map((r) => {
                                          'visitType': r.selectedVisitType,
                                          'notes': r.notesCtrl.text.trim().isEmpty ? null : r.notesCtrl.text.trim(),
                                          'fileUrl': r.attachedFileUrl,
                                          'fileName': r.attachedFileName,
                                          'fileId': r.attachedFileId,
                                        }).toList(),
                                      );
                                      if (ctx.mounted) Navigator.of(ctx).pop(ok);
                                    } finally {
                                      if (ctx.mounted) setSheetState(() => isSubmitting = false);
                                    }
                                  },
                            label: isSubmitting
                                ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                                : const Text('Save Records'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );

    if (!mounted || saved == null) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          saved ? 'Records saved for ${patient.fullName}' : 'Failed to save records.',
        ),
      ),
    );
  }

  Future<void> _showAddPrescriptionSheet(PartnerPatient patient) async {
    final partner = context.read<PartnerProvider>();
    final drugs = <_PrescriptionDrugForm>[_PrescriptionDrugForm()];

    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        bool isSubmitting = false;
        return StatefulBuilder(
          builder: (ctx, setSheetState) => Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(ctx).viewInsets.bottom,
            ),
            child: Container(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(ctx).size.height * 0.85,
              ),
              decoration: const BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.vertical(
                  top: Radius.circular(AppRadii.xl),
                ),
              ),
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.md,
                AppSpacing.lg,
                AppSpacing.xl,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.outlineVariant,
                        borderRadius: BorderRadius.circular(AppRadii.full),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Row(
                    children: [
                      const Icon(
                        Icons.add_reaction_outlined,
                        color: AppColors.primary,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Text(
                          'Add Prescriptions — ${patient.fullName}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Flexible(
                    child: SingleChildScrollView(
                      child: Column(
                        children: [
                          for (int i = 0; i < drugs.length; i++) ...[
                            Card(
                              margin: const EdgeInsets.only(bottom: AppSpacing.md),
                              color: AppColors.surfaceContainerLow,
                              child: Padding(
                                padding: const EdgeInsets.all(AppSpacing.md),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text('Drug #${i + 1}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                        if (drugs.length > 1)
                                          IconButton(
                                            icon: const Icon(Icons.delete_outline, color: Colors.red, size: 20),
                                            onPressed: () => setSheetState(() => drugs.removeAt(i)),
                                          ),
                                      ],
                                    ),
                                    const SizedBox(height: AppSpacing.sm),
                                    TextField(
                                      controller: drugs[i].medicineCtrl,
                                      decoration: const InputDecoration(labelText: 'Medicine Name', hintText: 'e.g. Lisinopril'),
                                    ),
                                    const SizedBox(height: AppSpacing.sm),
                                    TextField(
                                      controller: drugs[i].dosageCtrl,
                                      decoration: const InputDecoration(labelText: 'Dosage', hintText: 'e.g. 10mg'),
                                    ),
                                    const SizedBox(height: AppSpacing.sm),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: InkWell(
                                            onTap: () async {
                                              final picked = await showDatePicker(
                                                context: ctx,
                                                initialDate: drugs[i].startDate ?? DateTime.now(),
                                                firstDate: DateTime(2020),
                                                lastDate: DateTime(2030),
                                              );
                                              if (picked != null) setSheetState(() => drugs[i].startDate = picked);
                                            },
                                            child: InputDecorator(
                                              decoration: const InputDecoration(labelText: 'Start Date'),
                                              child: Text(drugs[i].startDate != null ? '${drugs[i].startDate!.day}/${drugs[i].startDate!.month}/${drugs[i].startDate!.year}' : 'Select'),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: AppSpacing.sm),
                                        Expanded(
                                          child: InkWell(
                                            onTap: () async {
                                              final picked = await showDatePicker(
                                                context: ctx,
                                                initialDate: drugs[i].endDate ?? (drugs[i].startDate ?? DateTime.now()).add(const Duration(days: 14)),
                                                firstDate: DateTime(2020),
                                                lastDate: DateTime(2030),
                                              );
                                              if (picked != null) setSheetState(() => drugs[i].endDate = picked);
                                            },
                                            child: InputDecorator(
                                              decoration: const InputDecoration(labelText: 'End Date'),
                                              child: Text(drugs[i].endDate != null ? '${drugs[i].endDate!.day}/${drugs[i].endDate!.month}/${drugs[i].endDate!.year}' : 'Select'),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: AppSpacing.sm),
                                    InputDecorator(
                                      decoration: const InputDecoration(labelText: 'Number of times daily'),
                                      child: DropdownButton<String>(
                                        value: drugs[i].timesDaily,
                                        isExpanded: true,
                                        underline: const SizedBox.shrink(),
                                        items: ['1 time daily', '2 times daily', '3 times daily', '4 times daily', 'As needed']
                                            .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                                            .toList(),
                                        onChanged: (val) => setSheetState(() => drugs[i].timesDaily = val ?? '1 time daily'),
                                      ),
                                    ),
                                    const SizedBox(height: AppSpacing.sm),
                                    TextField(
                                      controller: drugs[i].notesCtrl,
                                      maxLines: 2,
                                      decoration: const InputDecoration(labelText: 'Notes (optional)', hintText: 'Take after meals...'),
                                    ),
                                    const SizedBox(height: AppSpacing.sm),
                                    OutlinedButton.icon(
                                      icon: drugs[i].isUploading
                                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                                          : Icon(drugs[i].fileName != null ? Icons.check_circle : Icons.upload_file, size: 18),
                                      label: Text(drugs[i].fileName != null ? 'Attached: ${drugs[i].fileName}' : 'Attach Medical Record / Document'),
                                      onPressed: drugs[i].isUploading ? null : () async {
                                        final result = await FilePicker.platform.pickFiles(withData: true);
                                        final file = result?.files.single;
                                        if (file?.bytes != null) {
                                          setSheetState(() => drugs[i].isUploading = true);
                                          try {
                                            final res = await partner.uploadPatientFile(
                                              patient.id,
                                              fileName: file!.name,
                                              mimeType: 'application/octet-stream',
                                              bytes: file.bytes as Uint8List,
                                              category: 'Prescriptions',
                                            );
                                            if (res != null) {
                                              setSheetState(() {
                                                drugs[i].fileId = res['fileId'];
                                                drugs[i].fileName = res['fileName'];
                                                drugs[i].fileUrl = res['fileUrl'];
                                              });
                                            }
                                          } finally {
                                            setSheetState(() => drugs[i].isUploading = false);
                                          }
                                        }
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                          TextButton.icon(
                            icon: const Icon(Icons.add),
                            label: const Text('Add Another Drug'),
                            onPressed: () => setSheetState(() => drugs.add(_PrescriptionDrugForm())),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      icon: const Icon(Icons.check, size: 18),
                      onPressed: isSubmitting
                          ? null
                          : () async {
                              final validDrugs = drugs.where((d) => d.medicineCtrl.text.trim().isNotEmpty && d.dosageCtrl.text.trim().isNotEmpty).toList();
                              if (validDrugs.isEmpty) return;
                              setSheetState(() => isSubmitting = true);
                              try {
                                final payload = validDrugs.map((d) => {
                                  'medicineName': d.medicineCtrl.text.trim(),
                                  'dosage': d.dosageCtrl.text.trim(),
                                  'duration': (d.startDate != null && d.endDate != null) ? '${d.endDate!.difference(d.startDate!).inDays + 1} days' : '',
                                  if (d.notesCtrl.text.trim().isNotEmpty) 'notes': d.notesCtrl.text.trim(),
                                  if (d.startDate != null) 'startDate': d.startDate!.toIso8601String(),
                                  if (d.endDate != null) 'endDate': d.endDate!.toIso8601String(),
                                  'timesDaily': d.timesDaily,
                                  if (d.fileUrl != null) 'fileUrl': d.fileUrl,
                                  if (d.fileName != null) 'fileName': d.fileName,
                                  if (d.fileId != null) 'fileId': d.fileId,
                                }).toList();

                                final ok = await partner.addPrescription(
                                  patient.id,
                                  drugs: payload,
                                );
                                if (ctx.mounted) Navigator.of(ctx).pop(ok);
                              } finally {
                                if (ctx.mounted)
                                  setSheetState(() => isSubmitting = false);
                              }
                            },
                      label: isSubmitting
                          ? const SizedBox(
                              height: 18,
                              width: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Save Prescriptions'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );

    if (!mounted || saved == null) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          saved
              ? 'Prescriptions saved for ${patient.fullName}'
              : 'Failed to save prescriptions.',
        ),
      ),
    );
  }

  int _ageFromDob(DateTime? dob) {
    if (dob == null) return 0;
    final now = DateTime.now();
    var age = now.year - dob.year;
    if (now.month < dob.month || (now.month == dob.month && now.day < dob.day))
      age--;
    return age;
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
    } else {
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
  }

  @override
  Widget build(BuildContext context) {
    final partner = context.watch<PartnerProvider>();
    final detail = partner.selectedPatientDetail;
    final isLoading = partner.isLoadingPatientDetail;
    final error = partner.patientDetailError;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: Text(detail?.fullName ?? 'Patient Details'),
      ),
      body: SafeArea(
        child: isLoading || detail == null || detail.id != widget.patientId
            ? const Center(child: CircularProgressIndicator())
            : error != null
                ? Center(
                    child: Text(
                      error,
                      style: textTheme.bodySmall?.copyWith(color: AppColors.error),
                    ),
                  )
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(AppSpacing.lg),
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 30,
                                      child: Text(
                                        detail.fullName.isNotEmpty
                                            ? detail.fullName[0].toUpperCase()
                                            : '?',
                                        style: const TextStyle(fontSize: 20),
                                      ),
                                    ),
                                    const SizedBox(width: AppSpacing.md),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            detail.fullName,
                                            style: textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                                          ),
                                          Text(
                                            'Patient ID: ${detail.patientCode}',
                                            style: textTheme.bodyMedium?.copyWith(color: AppColors.onSurfaceVariant),
                                          ),
                                          if (detail.dob != null)
                                            Text(
                                              '${_ageFromDob(detail.dob)} yrs • ${detail.gender ?? 'Unknown gender'}',
                                              style: textTheme.bodyMedium?.copyWith(color: AppColors.onSurfaceVariant),
                                            ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                if (detail.bloodGroup != null || detail.genotype != null) ...[
                                  const SizedBox(height: AppSpacing.md),
                                  const Divider(),
                                  const SizedBox(height: AppSpacing.sm),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                                    children: [
                                      if (detail.bloodGroup != null)
                                        Column(
                                          children: [
                                            Text(
                                              'Blood',
                                              style: textTheme.labelSmall?.copyWith(color: AppColors.outline),
                                            ),
                                            Text(
                                              detail.bloodGroup!,
                                              style: textTheme.titleMedium?.copyWith(
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.error,
                                              ),
                                            ),
                                          ],
                                        ),
                                      if (detail.genotype != null)
                                        Column(
                                          children: [
                                            Text(
                                              'Genotype',
                                              style: textTheme.labelSmall?.copyWith(color: AppColors.outline),
                                            ),
                                            Text(
                                              detail.genotype!,
                                              style: textTheme.titleMedium?.copyWith(
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.primary,
                                              ),
                                            ),
                                          ],
                                        ),
                                    ],
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xl),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Medical Records',
                              style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        if (detail.medicalRecords.isEmpty)
                          Card(
                            elevation: 0,
                            color: AppColors.surfaceContainerLow,
                            child: Padding(
                              padding: const EdgeInsets.all(AppSpacing.xl),
                              child: Center(
                                child: Text(
                                  'No medical records yet.',
                                  style: textTheme.bodyMedium?.copyWith(color: AppColors.outline),
                                ),
                              ),
                            ),
                          )
                        else
                          for (final record in detail.medicalRecords)
                            Card(
                              margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                              child: Padding(
                                padding: const EdgeInsets.all(AppSpacing.md),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          record.visitType,
                                          style: textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                                        ),
                                        Text(
                                          _formatDate(record.createdAt),
                                          style: textTheme.labelSmall?.copyWith(color: AppColors.outline),
                                        ),
                                      ],
                                    ),
                                    if (record.notes.isNotEmpty) ...[
                                      const SizedBox(height: AppSpacing.sm),
                                      Text(record.notes, style: textTheme.bodyMedium),
                                    ],
                                    if (record.fileUrl != null && record.fileUrl!.isNotEmpty) ...[
                                      const SizedBox(height: AppSpacing.sm),
                                      OutlinedButton.icon(
                                        icon: const Icon(Icons.description_outlined, size: 16),
                                        label: Text(
                                          record.fileName?.isNotEmpty == true
                                              ? record.fileName!
                                              : 'View Attachment',
                                        ),
                                        onPressed: () => launchUrl(Uri.parse(record.fileUrl!)),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ),
                        const SizedBox(height: AppSpacing.xl),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Prescriptions',
                              style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        if (detail.prescriptions.isEmpty)
                          Card(
                            elevation: 0,
                            color: AppColors.surfaceContainerLow,
                            child: Padding(
                              padding: const EdgeInsets.all(AppSpacing.xl),
                              child: Center(
                                child: Text(
                                  'No active prescriptions.',
                                  style: textTheme.bodyMedium?.copyWith(color: AppColors.outline),
                                ),
                              ),
                            ),
                          )
                        else
                          for (final p in detail.prescriptions)
                            Card(
                              margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                              child: Padding(
                                padding: const EdgeInsets.all(AppSpacing.md),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    for (final d in p.drugs) ...[
                                      Row(
                                        children: [
                                          const Icon(Icons.medication_outlined, color: AppColors.primary, size: 20),
                                          const SizedBox(width: AppSpacing.sm),
                                          Expanded(
                                            child: Text(
                                              d.medicineName,
                                              style: textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text('${d.dosage} • ${d.timesDaily} • ${d.duration}', style: textTheme.bodySmall),
                                      if (d.notes.isNotEmpty) ...[
                                        const SizedBox(height: 4),
                                        Text('Note: ${d.notes}', style: textTheme.bodySmall?.copyWith(color: AppColors.onSurfaceVariant)),
                                      ],
                                      if (d.fileUrl != null && d.fileUrl!.isNotEmpty) ...[
                                        const SizedBox(height: AppSpacing.sm),
                                        OutlinedButton.icon(
                                          icon: const Icon(Icons.description_outlined, size: 16),
                                          label: Text(
                                            d.fileName?.isNotEmpty == true
                                                ? d.fileName!
                                                : 'View Attachment',
                                          ),
                                          onPressed: () => launchUrl(Uri.parse(d.fileUrl!)),
                                        ),
                                      ],
                                      const Divider(),
                                    ],
                                    const SizedBox(height: AppSpacing.xs),
                                    Text(
                                      'Issued ${_formatDate(p.createdAt)}',
                                      style: textTheme.labelSmall?.copyWith(color: AppColors.outline),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                      ],
                    ),
                  ),
      ),
      floatingActionButton: detail == null || detail.id != widget.patientId ? null : Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            heroTag: 'add_record',
            onPressed: () {
              final pat = partner.patients.firstWhere((p) => p.id == detail.id);
              _showIssueRecordSheet(pat);
            },
            tooltip: 'Add Medical Record',
            backgroundColor: AppColors.secondaryContainer,
            child: const Icon(Icons.note_add_outlined),
          ),
          const SizedBox(height: AppSpacing.md),
          FloatingActionButton(
            heroTag: 'add_rx',
            onPressed: () {
              final pat = partner.patients.firstWhere((p) => p.id == detail.id);
              _showAddPrescriptionSheet(pat);
            },
            tooltip: 'Add Prescription',
            child: const Icon(Icons.medical_services_outlined),
          ),
        ],
      ),
    );
  }
}
