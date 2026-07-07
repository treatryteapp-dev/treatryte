import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

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
                          icon: const Icon(Icons.feedback_outlined, size: 16),
                          label: const Text('Feedbacks'),
                          onPressed: () => context.push('/partner-feedbacks'),
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        FilledButton.tonalIcon(
                          icon: const Icon(
                            Icons.person_add_alt_1_outlined,
                            size: 16,
                          ),
                          label: const Text('New/Invite'),
                          onPressed: () {
                            showModalBottomSheet(
                              context: context,
                              builder: (ctx) => SafeArea(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    ListTile(
                                      leading: const Icon(Icons.person_add),
                                      title: const Text('Create New Patient'),
                                      subtitle: const Text('For walk-ins without TreatRyte accounts'),
                                      onTap: () {
                                        Navigator.pop(ctx);
                                        _showAddPatientDialog();
                                      },
                                    ),
                                    ListTile(
                                      leading: const Icon(Icons.mark_email_read),
                                      title: const Text('Invite Existing User'),
                                      subtitle: const Text('Link a TreatRyte user via email'),
                                      onTap: () {
                                        Navigator.pop(ctx);
                                        _showInvitePatientDialog();
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
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
          else if (filtered.isEmpty)
            const Expanded(
              child: Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Text(
                    'No patients yet. Add a new patient or send an invite to get started.',
                    style: TextStyle(color: AppColors.outline),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            )
          else
            Expanded(
              child: ListView.separated(
                itemCount: filtered.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final patient = filtered[index];
                  return ListTile(
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.lg,
                      vertical: AppSpacing.xs,
                    ),
                    leading: CircleAvatar(
                      radius: 24,
                      backgroundColor: AppColors.primaryContainer,
                      child: Text(
                        patient.fullName.isNotEmpty ? patient.fullName[0].toUpperCase() : '?',
                        style: const TextStyle(
                          color: AppColors.onPrimaryContainer,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    title: Text(
                      patient.fullName,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      '${patient.patientCode} • ${patient.email}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    trailing: const Icon(Icons.chevron_right, color: AppColors.outline),
                    onTap: () {
                      context.push('/partner-patients/${patient.id}');
                    },
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
