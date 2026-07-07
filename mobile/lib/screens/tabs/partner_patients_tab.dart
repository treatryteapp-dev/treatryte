import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../models/patient_models.dart';
import '../../providers/partner_provider.dart';
import '../../theme/app_theme.dart';

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

class PartnerPatientsTab extends StatefulWidget {
  const PartnerPatientsTab({super.key});

  @override
  State<PartnerPatientsTab> createState() => _PartnerPatientsTabState();
}

class _PartnerPatientsTabState extends State<PartnerPatientsTab> {
  bool _loaded = false;
  String? _selectedPatientId;
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<PartnerPatient> _filtered(List<PartnerPatient> all) {
    if (_searchQuery.isEmpty) return all;
    final q = _searchQuery.toLowerCase();
    return all
        .where(
          (p) =>
              p.fullName.toLowerCase().contains(q) ||
              p.email.toLowerCase().contains(q) ||
              p.patientCode.toLowerCase().contains(q),
        )
        .toList();
  }

  void _selectPatient(String id) {
    setState(() => _selectedPatientId = id);
    context.read<PartnerProvider>().loadPatientDetail(id);
  }

  Future<void> _showAddPatientDialog() async {
    final nameCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final partner = context.read<PartnerProvider>();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('New Patient'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Works for walk-ins too - no TreatRyte account needed. A unique patient ID is assigned automatically.',
              style: TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: nameCtrl,
              autofocus: true,
              decoration: const InputDecoration(
                labelText: 'Full Name',
                prefixIcon: Icon(Icons.person_outline),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            TextField(
              controller: emailCtrl,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Email',
                hintText: 'Required identifier for this patient',
                prefixIcon: Icon(Icons.email_outlined),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Add Patient'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;
    final name = nameCtrl.text.trim();
    final email = emailCtrl.text.trim();
    if (name.isEmpty || email.isEmpty) return;

    final patient = await partner.createPatient(fullName: name, email: email);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          patient != null
              ? '$name added (${patient.patientCode}).'
              : partner.patientsError ?? 'Failed to add patient.',
        ),
      ),
    );
  }

  Future<void> _showIssueRecordSheet(PartnerPatient patient) async {
    final notesCtrl = TextEditingController();
    String selectedVisitType = 'General Consultation';
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
        bool isUploading = false;
        String? attachedFileName;
        String? attachedFileUrl;
        String? attachedFileId;
        return StatefulBuilder(
          builder: (ctx, setSheetState) => Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(ctx).viewInsets.bottom,
            ),
            child: Container(
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
                  Text(
                    'Issue Medical Record — ${patient.fullName}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  InputDecorator(
                    decoration: const InputDecoration(labelText: 'Visit Type'),
                    child: DropdownButton<String>(
                      value: selectedVisitType,
                      underline: const SizedBox.shrink(),
                      isExpanded: true,
                      items: visitTypes
                          .map(
                            (t) => DropdownMenuItem<String>(
                              value: t,
                              child: Text(t),
                            ),
                          )
                          .toList(),
                      onChanged: (val) => setSheetState(
                        () => selectedVisitType = val ?? selectedVisitType,
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  TextField(
                    controller: notesCtrl,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      labelText: 'Clinical Notes',
                      alignLabelWithHint: true,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  OutlinedButton.icon(
                    icon: isUploading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Icon(
                            attachedFileName != null ? Icons.check_circle : Icons.upload_file,
                            size: 18,
                            color: attachedFileName != null ? AppColors.primary : null,
                          ),
                    label: Text(
                      attachedFileName != null ? 'Attached: $attachedFileName' : 'Attach Medical Record / Document',
                    ),
                    onPressed: isUploading
                        ? null
                        : () async {
                            final result = await FilePicker.platform.pickFiles(withData: true);
                            final file = result?.files.single;
                            if (file?.bytes != null) {
                              setSheetState(() => isUploading = true);
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
                                    attachedFileId = res['fileId'];
                                    attachedFileName = res['fileName'];
                                    attachedFileUrl = res['fileUrl'];
                                  });
                                }
                              } finally {
                                setSheetState(() => isUploading = false);
                              }
                            }
                          },
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      icon: const Icon(Icons.save_outlined, size: 18),
                      onPressed: isSubmitting || isUploading
                          ? null
                          : () async {
                              setSheetState(() => isSubmitting = true);
                              try {
                                final ok = await partner.issueMedicalRecord(
                                  patient.id,
                                  visitType: selectedVisitType,
                                  notes: notesCtrl.text.trim().isEmpty
                                      ? null
                                      : notesCtrl.text.trim(),
                                  fileUrl: attachedFileUrl,
                                  fileName: attachedFileName,
                                  fileId: attachedFileId,
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
                          : const Text('Save Record'),
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
              ? 'Record saved for ${patient.fullName}'
              : 'Failed to save record.',
        ),
      ),
    );
  }

  Future<void> _showInvitePatientDialog([String? initialEmail]) async {
    final emailCtrl = TextEditingController(text: initialEmail);
    final partner = context.read<PartnerProvider>();

    final email = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Invite Patient'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Enter the patient\'s TreatRyte account email to link them to your directory.',
              style: TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: emailCtrl,
              autofocus: true,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Patient Email',
                hintText: 'e.g. patient@email.com',
                prefixIcon: Icon(Icons.person_search_outlined),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(emailCtrl.text.trim()),
            child: const Text('Send Invite'),
          ),
        ],
      ),
    );

    if (email == null || email.isEmpty) return;
    final ok = await partner.invitePatient(email);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          ok
              ? 'Invite sent to $email'
              : partner.patientsError ?? 'Failed to send invite.',
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
    if (!_loaded) {
      _loaded = true;
      final provider = context.read<PartnerProvider>();
      Future.microtask(() => provider.loadPatients());
    }

    final textTheme = Theme.of(context).textTheme;
    final partner = context.watch<PartnerProvider>();
    final filtered = _filtered(partner.patients);
    _selectedPatientId ??= filtered.isNotEmpty ? filtered.first.id : null;
    if (_selectedPatientId != null &&
        filtered.isNotEmpty &&
        !filtered.any((p) => p.id == _selectedPatientId) &&
        filtered.isNotEmpty) {
      _selectedPatientId = filtered.first.id;
    }

    final detail = partner.selectedPatientDetail;
    final showDetail = detail != null && detail.id == _selectedPatientId;

    return SafeArea(
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            color: AppColors.surfaceContainerLowest,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: AppSpacing.sm,
                  runSpacing: AppSpacing.sm,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  alignment: WrapAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Patient Directory',
                          style: textTheme.headlineSmall,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Manage and access your patient records.',
                          style: textTheme.bodySmall,
                        ),
                      ],
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        OutlinedButton.icon(
                          icon: const Icon(Icons.person_add_outlined, size: 16),
                          label: const Text('New'),
                          onPressed: _showAddPatientDialog,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        FilledButton.tonalIcon(
                          icon: const Icon(
                            Icons.person_add_alt_1_outlined,
                            size: 16,
                          ),
                          label: const Text('Invite'),
                          onPressed: _showInvitePatientDialog,
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                TextField(
                  controller: _searchController,
                  onChanged: (value) => setState(() => _searchQuery = value),
                  decoration: const InputDecoration(
                    hintText: 'Search by name, email or ID...',
                    prefixIcon: Icon(Icons.search, color: AppColors.outline),
                    isDense: true,
                  ),
                ),
              ],
            ),
          ),

          if (partner.isLoadingPatients && partner.patients.isEmpty)
            const Expanded(child: Center(child: CircularProgressIndicator()))
          else ...[
            SizedBox(
              height: 88,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: AppColors.outlineVariant.withValues(alpha: 0.2),
                    ),
                  ),
                ),
                child: filtered.isEmpty
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(
                            horizontal: AppSpacing.lg,
                          ),
                          child: Text(
                            'No patients yet. Add a new patient or send an invite to get started.',
                            style: TextStyle(color: AppColors.outline),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      )
                    : ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.lg,
                          vertical: AppSpacing.sm,
                        ),
                        itemCount: filtered.length,
                        itemBuilder: (context, index) {
                          final patient = filtered[index];
                          final isSelected = patient.id == _selectedPatientId;
                          return Padding(
                            padding: const EdgeInsets.only(
                              right: AppSpacing.sm,
                            ),
                            child: ChoiceChip(
                              avatar: CircleAvatar(
                                child: Text(
                                  patient.fullName.isNotEmpty
                                      ? patient.fullName[0].toUpperCase()
                                      : '?',
                                ),
                              ),
                              label: Text(patient.fullName),
                              selected: isSelected,
                              selectedColor: AppColors.primaryContainer
                                  .withValues(alpha: 0.2),
                              labelStyle: TextStyle(
                                color: isSelected
                                    ? AppColors.primary
                                    : AppColors.onSurfaceVariant,
                                fontWeight: isSelected
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(
                                  AppRadii.lg,
                                ),
                                side: BorderSide(
                                  color: isSelected
                                      ? AppColors.primary
                                      : AppColors.outlineVariant,
                                ),
                              ),
                              onSelected: (selected) {
                                if (selected) _selectPatient(patient.id);
                              },
                            ),
                          );
                        },
                      ),
              ),
            ),

            if (_selectedPatientId == null)
              const Expanded(
                child: Center(
                  child: Text(
                    'No patient selected.',
                    style: TextStyle(color: AppColors.outline),
                  ),
                ),
              )
            else if (partner.isLoadingPatientDetail && !showDetail)
              const Expanded(child: Center(child: CircularProgressIndicator()))
            else if (!showDetail)
              Expanded(
                child: Center(
                  child: Text(
                    partner.patientDetailError ??
                        'Could not load patient details.',
                    style: textTheme.bodySmall?.copyWith(
                      color: AppColors.error,
                    ),
                  ),
                ),
              )
            else
              Expanded(
                child: SingleChildScrollView(
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
                                  const SizedBox(width: AppSpacing.lg),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          detail.fullName,
                                          style: textTheme.headlineSmall,
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '${_ageFromDob(detail.dateOfBirth)} years old • ${detail.gender ?? 'Unknown'}',
                                          style: textTheme.bodySmall,
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '${detail.patientCode} • ${detail.email}',
                                          style: textTheme.bodySmall?.copyWith(
                                            color: AppColors.outline,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: AppSpacing.md),
                              Wrap(
                                spacing: AppSpacing.sm,
                                runSpacing: AppSpacing.sm,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: AppSpacing.md,
                                      vertical: 6,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.secondaryContainer,
                                      borderRadius: BorderRadius.circular(
                                        AppRadii.full,
                                      ),
                                    ),
                                    child: Text(
                                      'Blood Group: ${detail.medicalProfile.bloodGroup ?? 'Unknown'}',
                                      style: const TextStyle(
                                        color: AppColors.onSecondaryContainer,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  if (detail.medicalProfile.allergies.isEmpty)
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: AppSpacing.md,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.errorContainer,
                                        borderRadius: BorderRadius.circular(
                                          AppRadii.full,
                                        ),
                                      ),
                                      child: const Text(
                                        'Allergy: None recorded',
                                        style: TextStyle(
                                          color: AppColors.onErrorContainer,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    )
                                  else
                                    for (final allergy
                                        in detail.medicalProfile.allergies)
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: AppSpacing.md,
                                          vertical: 6,
                                        ),
                                        decoration: BoxDecoration(
                                          color: AppColors.errorContainer,
                                          borderRadius: BorderRadius.circular(
                                            AppRadii.full,
                                          ),
                                        ),
                                        child: Text(
                                          'Allergy: $allergy',
                                          style: const TextStyle(
                                            color: AppColors.onErrorContainer,
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                ],
                              ),
                              const Divider(height: AppSpacing.xl),
                              Row(
                                children: [
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      onPressed: () => _showIssueRecordSheet(
                                        filtered.firstWhere(
                                          (p) => p.id == detail.id,
                                        ),
                                      ),
                                      icon: const Icon(
                                        Icons.assignment_outlined,
                                        size: 18,
                                      ),
                                      label: const Text('Issue Record'),
                                      style: OutlinedButton.styleFrom(
                                        minimumSize: const Size.fromHeight(48),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: AppSpacing.sm),
                                  Expanded(
                                    child: ElevatedButton.icon(
                                      onPressed: () =>
                                          _showAddPrescriptionSheet(
                                            filtered.firstWhere(
                                              (p) => p.id == detail.id,
                                            ),
                                          ),
                                      icon: const Icon(
                                        Icons.add_reaction,
                                        size: 18,
                                      ),
                                      label: const Text('Add Prescription'),
                                      style: ElevatedButton.styleFrom(
                                        minimumSize: const Size.fromHeight(48),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              if (detail.connectionStatus != 'accepted' && detail.connectionStatus != 'pending') ...[
                                const SizedBox(height: AppSpacing.sm),
                                SizedBox(
                                  width: double.infinity,
                                  child: FilledButton.tonalIcon(
                                    onPressed: () => _showInvitePatientDialog(detail.email),
                                    icon: const Icon(Icons.person_add_alt_1, size: 18),
                                    label: const Text('Invite to Connect'),
                                    style: FilledButton.styleFrom(
                                      minimumSize: const Size.fromHeight(48),
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),

                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(AppSpacing.lg),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(
                                    Icons.folder_shared_outlined,
                                    color: AppColors.primary,
                                    size: 20,
                                  ),
                                  const SizedBox(width: AppSpacing.sm),
                                  Text(
                                    'Medical Records',
                                    style: textTheme.headlineSmall?.copyWith(
                                      fontSize: 18,
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: AppSpacing.lg),
                              if (detail.medicalRecords.isEmpty)
                                Text(
                                  'No medical records issued yet.',
                                  style: textTheme.bodySmall,
                                )
                              else
                                for (final record in detail.medicalRecords)
                                  Padding(
                                    padding: const EdgeInsets.only(
                                      bottom: AppSpacing.sm,
                                    ),
                                    child: Container(
                                      padding: const EdgeInsets.all(
                                        AppSpacing.sm,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.surfaceContainerLow,
                                        borderRadius: BorderRadius.circular(
                                          AppRadii.md,
                                        ),
                                      ),
                                      child: Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.all(6),
                                            decoration: BoxDecoration(
                                              color: AppColors.surfaceContainer,
                                              borderRadius:
                                                  BorderRadius.circular(
                                                    AppRadii.sm,
                                                  ),
                                            ),
                                            child: const Icon(
                                              Icons.assignment_outlined,
                                              color: AppColors.primary,
                                              size: 16,
                                            ),
                                          ),
                                          const SizedBox(width: AppSpacing.md),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  record.visitType,
                                                  style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 14,
                                                  ),
                                                ),
                                                if (record.notes.isNotEmpty)
                                                  Text(
                                                    record.notes,
                                                    style: textTheme.bodySmall,
                                                  ),
                                                const SizedBox(height: 2),
                                                Text(
                                                  _formatDate(record.createdAt),
                                                  style: textTheme.bodySmall
                                                      ?.copyWith(
                                                        color:
                                                            AppColors.outline,
                                                        fontSize: 11,
                                                      ),
                                                ),
                                                if (record.fileUrl != null && record.fileUrl!.isNotEmpty) ...[
                                                  const SizedBox(height: 4),
                                                  InkWell(
                                                    onTap: () async {
                                                      final uri = Uri.parse(record.fileUrl!);
                                                      if (await canLaunchUrl(uri)) {
                                                        await launchUrl(uri, mode: LaunchMode.platformDefault, webOnlyWindowName: '_blank');
                                                      }
                                                    },
                                                    child: Row(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        const Icon(Icons.attach_file, size: 14, color: AppColors.primary),
                                                        const SizedBox(width: 4),
                                                        Text(
                                                          record.fileName ?? 'Attached Document',
                                                          style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600, decoration: TextDecoration.underline),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ],
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),

                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(AppSpacing.lg),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(
                                    Icons.history_edu,
                                    color: AppColors.primary,
                                    size: 20,
                                  ),
                                  const SizedBox(width: AppSpacing.sm),
                                  Text(
                                    'Prescriptions',
                                    style: textTheme.headlineSmall?.copyWith(
                                      fontSize: 18,
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: AppSpacing.lg),
                              if (detail.prescriptions.isEmpty)
                                Text(
                                  'No prescriptions recorded yet.',
                                  style: textTheme.bodySmall,
                                )
                              else
                                for (final rx in detail.prescriptions)
                                  Padding(
                                    padding: const EdgeInsets.only(
                                      bottom: AppSpacing.sm,
                                    ),
                                    child: Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(6),
                                          decoration: BoxDecoration(
                                            color: AppColors.surfaceContainer,
                                            borderRadius: BorderRadius.circular(
                                              AppRadii.sm,
                                            ),
                                          ),
                                          child: const Icon(
                                            Icons.monitor_heart,
                                            color: AppColors.secondary,
                                            size: 16,
                                          ),
                                        ),
                                        const SizedBox(width: AppSpacing.md),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                '${rx.medicineName} (${rx.dosage})',
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 14,
                                                ),
                                              ),
                                              Text(
                                                '${rx.duration}${rx.timesDaily != null ? ' • ${rx.timesDaily}' : ''}${rx.notes.isNotEmpty ? ' • ${rx.notes}' : ''}',
                                                style: textTheme.bodySmall,
                                              ),
                                              if (rx.fileUrl != null && rx.fileUrl!.isNotEmpty) ...[
                                                const SizedBox(height: 4),
                                                InkWell(
                                                  onTap: () async {
                                                    final uri = Uri.parse(rx.fileUrl!);
                                                    if (await canLaunchUrl(uri)) {
                                                      await launchUrl(uri, mode: LaunchMode.platformDefault, webOnlyWindowName: '_blank');
                                                    }
                                                  },
                                                  child: Row(
                                                    mainAxisSize: MainAxisSize.min,
                                                    children: [
                                                      const Icon(Icons.attach_file, size: 14, color: AppColors.primary),
                                                      const SizedBox(width: 4),
                                                      Text(
                                                        rx.fileName ?? 'Attached Document',
                                                        style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600, decoration: TextDecoration.underline),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),

                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(AppSpacing.lg),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(
                                    Icons.description,
                                    color: AppColors.primary,
                                    size: 20,
                                  ),
                                  const SizedBox(width: AppSpacing.sm),
                                  Text(
                                    'Recent Reports',
                                    style: textTheme.headlineSmall?.copyWith(
                                      fontSize: 18,
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: AppSpacing.lg),
                              if (detail.reports.isEmpty)
                                Text(
                                  'No reports uploaded for this patient yet.',
                                  style: textTheme.bodySmall,
                                )
                              else
                                for (final report in detail.reports)
                                  Padding(
                                    padding: const EdgeInsets.only(
                                      bottom: AppSpacing.sm,
                                    ),
                                    child: InkWell(
                                      onTap: () async {
                                        if (report.url != null && report.url!.isNotEmpty) {
                                          final uri = Uri.parse(report.url!);
                                          if (await canLaunchUrl(uri)) {
                                            await launchUrl(uri, mode: LaunchMode.platformDefault, webOnlyWindowName: '_blank');
                                          } else {
                                            if (context.mounted) {
                                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not open file.')));
                                            }
                                          }
                                        } else {
                                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('File preview not available.')));
                                        }
                                      },
                                      borderRadius: BorderRadius.circular(AppRadii.md),
                                      child: Container(
                                        padding: const EdgeInsets.all(
                                          AppSpacing.sm,
                                        ),
                                        decoration: BoxDecoration(
                                          color: AppColors.surfaceContainerLow,
                                          borderRadius: BorderRadius.circular(
                                            AppRadii.md,
                                          ),
                                        ),
                                        child: Row(
                                          children: [
                                            const Icon(
                                              Icons.picture_as_pdf,
                                              color: AppColors.error,
                                            ),
                                            const SizedBox(width: AppSpacing.sm),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    report.fileName,
                                                    style: const TextStyle(
                                                      fontWeight: FontWeight.bold,
                                                      fontSize: 13,
                                                    ),
                                                  ),
                                                  const SizedBox(height: 2),
                                                  Builder(
                                                    builder: (context) {
                                                      final isPatientUploaded = report.uploadedBy == null || report.uploadedBy == 'Patient Uploaded' || report.sourceType == 'patient';
                                                      return Text(
                                                        isPatientUploaded ? 'Patient Uploaded' : 'Uploaded by ${report.uploadedBy}',
                                                        style: TextStyle(
                                                          fontSize: 11,
                                                          color: !isPatientUploaded
                                                              ? AppColors.primary
                                                              : AppColors.onSurfaceVariant,
                                                          fontWeight: !isPatientUploaded
                                                              ? FontWeight.w600
                                                              : FontWeight.normal,
                                                        ),
                                                      );
                                                    },
                                                  ),
                                                ],
                                              ),
                                            ),
                                            const Icon(Icons.open_in_new, size: 16, color: AppColors.onSurfaceVariant),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ],
      ),
    );
  }
}
