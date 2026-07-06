import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/patient_models.dart';
import '../../providers/partner_provider.dart';
import '../../theme/app_theme.dart';

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
        .where((p) =>
            p.fullName.toLowerCase().contains(q) ||
            p.email.toLowerCase().contains(q) ||
            p.patientCode.toLowerCase().contains(q))
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
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Cancel')),
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
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
          child: Container(
            decoration: const BoxDecoration(
              color: AppColors.surfaceContainerLowest,
              borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadii.xl)),
            ),
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, AppSpacing.xl),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Issue Medical Record — ${patient.fullName}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: AppSpacing.md),
                InputDecorator(
                  decoration: const InputDecoration(labelText: 'Visit Type'),
                  child: DropdownButton<String>(
                    value: selectedVisitType,
                    underline: const SizedBox.shrink(),
                    isExpanded: true,
                    items: visitTypes.map((t) => DropdownMenuItem<String>(value: t, child: Text(t))).toList(),
                    onChanged: (val) => setSheetState(() => selectedVisitType = val ?? selectedVisitType),
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                TextField(
                  controller: notesCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Clinical Notes', alignLabelWithHint: true),
                ),
                const SizedBox(height: AppSpacing.lg),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    icon: const Icon(Icons.save_outlined, size: 18),
                    label: const Text('Save Record'),
                    onPressed: () async {
                      final ok = await partner.issueMedicalRecord(
                        patient.id,
                        visitType: selectedVisitType,
                        notes: notesCtrl.text.trim().isEmpty ? null : notesCtrl.text.trim(),
                      );
                      if (ctx.mounted) Navigator.of(ctx).pop(ok);
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    if (!mounted || saved == null) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(saved ? 'Record saved for ${patient.fullName}' : 'Failed to save record.')),
    );
  }

  Future<void> _showInvitePatientDialog() async {
    final emailCtrl = TextEditingController();
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
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
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
      SnackBar(content: Text(ok ? 'Invite sent to $email' : partner.patientsError ?? 'Failed to send invite.')),
    );
  }

  Future<void> _showAddPrescriptionSheet(PartnerPatient patient) async {
    final medicineCtrl = TextEditingController();
    final dosageCtrl = TextEditingController();
    final durationCtrl = TextEditingController();
    final notesCtrl = TextEditingController();
    final partner = context.read<PartnerProvider>();

    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Container(
          decoration: const BoxDecoration(
            color: AppColors.surfaceContainerLowest,
            borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadii.xl)),
          ),
          padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, AppSpacing.xl),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.outlineVariant,
                    borderRadius: BorderRadius.circular(AppRadii.full),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  const Icon(Icons.add_reaction_outlined, color: AppColors.primary),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    'Add Prescription — ${patient.fullName}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              TextField(
                controller: medicineCtrl,
                decoration: const InputDecoration(labelText: 'Medicine Name', hintText: 'e.g. Lisinopril'),
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: dosageCtrl,
                      decoration: const InputDecoration(labelText: 'Dosage', hintText: 'e.g. 10mg'),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: TextField(
                      controller: durationCtrl,
                      decoration: const InputDecoration(labelText: 'Duration', hintText: 'e.g. 14 days'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              TextField(
                controller: notesCtrl,
                maxLines: 2,
                decoration: const InputDecoration(labelText: 'Notes (optional)', hintText: 'Take after meals...'),
              ),
              const SizedBox(height: AppSpacing.lg),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  icon: const Icon(Icons.check, size: 18),
                  label: const Text('Save Prescription'),
                  onPressed: () async {
                    if (medicineCtrl.text.trim().isEmpty || dosageCtrl.text.trim().isEmpty || durationCtrl.text.trim().isEmpty) {
                      return;
                    }
                    final ok = await partner.addPrescription(
                      patient.id,
                      medicineName: medicineCtrl.text.trim(),
                      dosage: dosageCtrl.text.trim(),
                      duration: durationCtrl.text.trim(),
                      notes: notesCtrl.text.trim().isEmpty ? null : notesCtrl.text.trim(),
                    );
                    if (ctx.mounted) Navigator.of(ctx).pop(ok);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );

    if (!mounted || saved == null) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(saved ? 'Prescription saved for ${patient.fullName}' : 'Failed to save prescription.')),
    );
  }

  int _ageFromDob(DateTime? dob) {
    if (dob == null) return 0;
    final now = DateTime.now();
    var age = now.year - dob.year;
    if (now.month < dob.month || (now.month == dob.month && now.day < dob.day)) age--;
    return age;
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
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Patient Directory', style: textTheme.headlineSmall),
                          const SizedBox(height: 2),
                          Text(
                            'Manage and access your patient records.',
                            style: textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.person_add_outlined, size: 18),
                      label: const Text('New'),
                      onPressed: _showAddPatientDialog,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    FilledButton.tonalIcon(
                      icon: const Icon(Icons.person_add_alt_1_outlined, size: 18),
                      label: const Text('Invite'),
                      onPressed: _showInvitePatientDialog,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                TextField(
                  controller: _searchController,
                  onChanged: (value) => setState(() => _searchQuery = value),
                  decoration: const InputDecoration(
                    hintText: 'Search by name, email, or patient ID...',
                    prefixIcon: Icon(Icons.search, color: AppColors.outline),
                  ),
                ),
              ],
            ),
          ),

          if (partner.isLoadingPatients && partner.patients.isEmpty)
            const Expanded(child: Center(child: CircularProgressIndicator()))
          else ...[
            SizedBox(
              height: 72,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.2)),
                  ),
                ),
                child: filtered.isEmpty
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                          child: Text(
                            'No patients yet. Add a new patient or send an invite to get started.',
                            style: TextStyle(color: AppColors.outline),
                          ),
                        ),
                      )
                    : ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                        itemCount: filtered.length,
                        itemBuilder: (context, index) {
                          final patient = filtered[index];
                          final isSelected = patient.id == _selectedPatientId;
                          return Padding(
                            padding: const EdgeInsets.only(right: AppSpacing.sm),
                            child: ChoiceChip(
                              avatar: CircleAvatar(
                                child: Text(patient.fullName.isNotEmpty ? patient.fullName[0].toUpperCase() : '?'),
                              ),
                              label: Text(patient.fullName),
                              selected: isSelected,
                              selectedColor: AppColors.primaryContainer.withValues(alpha: 0.2),
                              labelStyle: TextStyle(
                                color: isSelected ? AppColors.primary : AppColors.onSurfaceVariant,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(AppRadii.lg),
                                side: BorderSide(color: isSelected ? AppColors.primary : AppColors.outlineVariant),
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
                child: Center(child: Text('No patient selected.', style: TextStyle(color: AppColors.outline))),
              )
            else if (partner.isLoadingPatientDetail && !showDetail)
              const Expanded(child: Center(child: CircularProgressIndicator()))
            else if (!showDetail)
              Expanded(
                child: Center(
                  child: Text(
                    partner.patientDetailError ?? 'Could not load patient details.',
                    style: textTheme.bodySmall?.copyWith(color: AppColors.error),
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
                                      detail.fullName.isNotEmpty ? detail.fullName[0].toUpperCase() : '?',
                                      style: const TextStyle(fontSize: 20),
                                    ),
                                  ),
                                  const SizedBox(width: AppSpacing.lg),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(detail.fullName, style: textTheme.headlineSmall),
                                        const SizedBox(height: 2),
                                        Text(
                                          '${_ageFromDob(detail.dateOfBirth)} years old • ${detail.gender ?? 'Unknown'}',
                                          style: textTheme.bodySmall,
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '${detail.patientCode} • ${detail.email}',
                                          style: textTheme.bodySmall?.copyWith(color: AppColors.outline),
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
                                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: AppColors.secondaryContainer,
                                      borderRadius: BorderRadius.circular(AppRadii.full),
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
                                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: AppColors.errorContainer,
                                        borderRadius: BorderRadius.circular(AppRadii.full),
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
                                    for (final allergy in detail.medicalProfile.allergies)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: AppColors.errorContainer,
                                          borderRadius: BorderRadius.circular(AppRadii.full),
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
                                        filtered.firstWhere((p) => p.id == detail.id),
                                      ),
                                      icon: const Icon(Icons.assignment_outlined, size: 18),
                                      label: const Text('Issue Record'),
                                      style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
                                    ),
                                  ),
                                  const SizedBox(width: AppSpacing.sm),
                                  Expanded(
                                    child: ElevatedButton.icon(
                                      onPressed: () => _showAddPrescriptionSheet(
                                        filtered.firstWhere((p) => p.id == detail.id),
                                      ),
                                      icon: const Icon(Icons.add_reaction, size: 18),
                                      label: const Text('Add Prescription'),
                                      style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
                                    ),
                                  ),
                                ],
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
                                  const Icon(Icons.folder_shared_outlined, color: AppColors.primary, size: 20),
                                  const SizedBox(width: AppSpacing.sm),
                                  Text('Medical Records', style: textTheme.headlineSmall?.copyWith(fontSize: 18)),
                                ],
                              ),
                              const Divider(height: AppSpacing.lg),
                              if (detail.medicalRecords.isEmpty)
                                Text('No medical records issued yet.', style: textTheme.bodySmall)
                              else
                                for (final record in detail.medicalRecords)
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                                    child: Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(6),
                                          decoration: BoxDecoration(
                                            color: AppColors.surfaceContainer,
                                            borderRadius: BorderRadius.circular(AppRadii.sm),
                                          ),
                                          child: const Icon(Icons.assignment_outlined, color: AppColors.primary, size: 16),
                                        ),
                                        const SizedBox(width: AppSpacing.md),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                record.visitType,
                                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                              ),
                                              if (record.notes.isNotEmpty)
                                                Text(record.notes, style: textTheme.bodySmall),
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
                                  const Icon(Icons.history_edu, color: AppColors.primary, size: 20),
                                  const SizedBox(width: AppSpacing.sm),
                                  Text('Prescriptions', style: textTheme.headlineSmall?.copyWith(fontSize: 18)),
                                ],
                              ),
                              const Divider(height: AppSpacing.lg),
                              if (detail.prescriptions.isEmpty)
                                Text('No prescriptions recorded yet.', style: textTheme.bodySmall)
                              else
                                for (final rx in detail.prescriptions)
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                                    child: Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(6),
                                          decoration: BoxDecoration(
                                            color: AppColors.surfaceContainer,
                                            borderRadius: BorderRadius.circular(AppRadii.sm),
                                          ),
                                          child: const Icon(Icons.monitor_heart, color: AppColors.secondary, size: 16),
                                        ),
                                        const SizedBox(width: AppSpacing.md),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                '${rx.medicineName} (${rx.dosage})',
                                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                              ),
                                              Text('${rx.duration}${rx.notes.isNotEmpty ? ' • ${rx.notes}' : ''}',
                                                  style: textTheme.bodySmall),
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
                                  const Icon(Icons.description, color: AppColors.primary, size: 20),
                                  const SizedBox(width: AppSpacing.sm),
                                  Text('Recent Reports', style: textTheme.headlineSmall?.copyWith(fontSize: 18)),
                                ],
                              ),
                              const Divider(height: AppSpacing.lg),
                              if (detail.reports.isEmpty)
                                Text('No reports uploaded for this patient yet.', style: textTheme.bodySmall)
                              else
                                for (final report in detail.reports)
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                                    child: Container(
                                      padding: const EdgeInsets.all(AppSpacing.sm),
                                      decoration: BoxDecoration(
                                        color: AppColors.surfaceContainerLow,
                                        borderRadius: BorderRadius.circular(AppRadii.md),
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(Icons.picture_as_pdf, color: AppColors.error),
                                          const SizedBox(width: AppSpacing.sm),
                                          Expanded(
                                            child: Text(
                                              report.fileName,
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
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
                  ),
                ),
              ),
          ],
        ],
      ),
    );
  }
}
