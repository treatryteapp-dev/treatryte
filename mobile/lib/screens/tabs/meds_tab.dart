import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/medication_models.dart';
import '../../providers/medication_provider.dart';
import '../../theme/app_theme.dart';

class MedsTab extends StatefulWidget {
  const MedsTab({super.key});

  @override
  State<MedsTab> createState() => _MedsTabState();
}

class _MedsTabState extends State<MedsTab> {
  String? _selectedMood;
  final _notesController = TextEditingController();
  bool _submittingFeedback = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MedicationProvider>().refresh();
    });
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submitFeedback(String? doseLogId) async {
    if (_selectedMood == null || doseLogId == null) return;
    setState(() => _submittingFeedback = true);
    await context.read<MedicationProvider>().submitMood(
          doseLogId,
          mood: _selectedMood!,
          note: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
        );
    if (!mounted) return;
    setState(() => _submittingFeedback = false);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Feedback submitted. Thank you!')),
    );
  }

  static const _moods = [
    (icon: Icons.sentiment_satisfied_alt, label: 'Feeling well'),
    (icon: Icons.sick_outlined, label: 'Mild nausea'),
    (icon: Icons.bedtime_outlined, label: 'Fatigue'),
  ];

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final medications = context.watch<MedicationProvider>();
    final feedbackTargetId =
        medications.nextDose?.doseLogId ?? (medications.schedule.isNotEmpty ? medications.schedule.last.doseLogId : null);

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => context.read<MedicationProvider>().refresh(),
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
              Text('Daily Meds', style: textTheme.headlineMedium),
              const SizedBox(height: 2),
              Text(
                'Manage your health and financial wellness seamlessly.',
                style: textTheme.bodySmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              if (medications.isLoading && medications.schedule.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: AppSpacing.lg),
                  child: Center(child: CircularProgressIndicator()),
                )
              else ...[
                if (medications.nextDose != null) _ActiveMedicationCard(dose: medications.nextDose!),
                const SizedBox(height: AppSpacing.xl),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Today's Schedule", style: textTheme.headlineSmall),
                    TextButton(onPressed: () {}, child: const Text('View History')),
                  ],
                ),
                if (medications.schedule.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                    child: Text('No medications scheduled for today.', style: textTheme.bodySmall),
                  )
                else
                  for (final dose in medications.schedule) _DoseTile(dose: dose),
              ],
              const SizedBox(height: AppSpacing.xl),
              Text('Feedback Log', style: textTheme.headlineSmall),
              const SizedBox(height: 4),
              Text('How are you feeling after your dose?', style: textTheme.bodySmall),
              const SizedBox(height: AppSpacing.md),
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: [
                  for (final mood in _moods)
                    ChoiceChip(
                      avatar: Icon(mood.icon, size: 16),
                      label: Text(mood.label),
                      selected: _selectedMood == mood.label,
                      onSelected: (_) => setState(() => _selectedMood = mood.label),
                      selectedColor: AppColors.primary,
                      labelStyle: TextStyle(
                        color: _selectedMood == mood.label
                            ? Colors.white
                            : AppColors.onSurfaceVariant,
                        fontWeight: FontWeight.w600,
                      ),
                      backgroundColor: AppColors.surfaceContainerLowest,
                      side: BorderSide(
                        color: _selectedMood == mood.label
                            ? AppColors.primary
                            : AppColors.outlineVariant,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              TextField(
                controller: _notesController,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Additional notes (e.g., Slightly dizzy but manageable)',
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: (_selectedMood != null && feedbackTargetId != null && !_submittingFeedback)
                      ? () => _submitFeedback(feedbackTargetId)
                      : null,
                  child: _submittingFeedback
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Submit to Doctor'),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              _MedPlanBanner(active: medications.planStatus == 'active'),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActiveMedicationCard extends StatefulWidget {
  const _ActiveMedicationCard({required this.dose});

  final DoseScheduleItem dose;

  @override
  State<_ActiveMedicationCard> createState() => _ActiveMedicationCardState();
}

class _ActiveMedicationCardState extends State<_ActiveMedicationCard> {
  Timer? _timer;
  Duration _remaining = Duration.zero;
  bool _logging = false;

  @override
  void initState() {
    super.initState();
    _updateRemaining();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _updateRemaining());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _updateRemaining() {
    final diff = widget.dose.scheduledFor.difference(DateTime.now());
    setState(() => _remaining = diff.isNegative ? Duration.zero : diff);
  }

  String get _formattedCountdown {
    final hours = _remaining.inHours.toString().padLeft(2, '0');
    final minutes = (_remaining.inMinutes % 60).toString().padLeft(2, '0');
    final seconds = (_remaining.inSeconds % 60).toString().padLeft(2, '0');
    return '$hours:$minutes:$seconds';
  }

  Future<void> _logDose() async {
    setState(() => _logging = true);
    await context.read<MedicationProvider>().logDose(widget.dose.doseLogId);
    if (mounted) setState(() => _logging = false);
  }

  @override
  Widget build(BuildContext context) {
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
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.white24,
              borderRadius: BorderRadius.circular(AppRadii.full),
            ),
            child: const Text(
              'UPCOMING DOSE',
              style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            widget.dose.medicationName,
            style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700),
          ),
          Text(
            'Dosage: ${widget.dose.dosage}',
            style: const TextStyle(color: Colors.white70, fontSize: 13),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            _formattedCountdown,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
            ),
          ),
          const Text(
            'Next dose in',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _logging ? null : _logDose,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AppColors.primary,
              ),
              child: _logging
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Log Dose'),
            ),
          ),
        ],
      ),
    );
  }
}

class _DoseTile extends StatelessWidget {
  const _DoseTile({required this.dose});

  final DoseScheduleItem dose;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final taken = dose.taken;
    final time = TimeOfDay.fromDateTime(dose.scheduledFor.toLocal()).format(context);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: taken ? AppColors.secondaryContainer : AppColors.errorContainer,
              borderRadius: BorderRadius.circular(AppRadii.md),
            ),
            child: Icon(
              taken ? Icons.check : Icons.schedule,
              size: 20,
              color: taken ? AppColors.onSecondaryContainer : AppColors.error,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(dose.medicationName, style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                Text(time, style: textTheme.bodySmall),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 4),
            decoration: BoxDecoration(
              color: taken ? AppColors.secondaryContainer : AppColors.errorContainer,
              borderRadius: BorderRadius.circular(AppRadii.full),
            ),
            child: Text(
              taken ? 'Taken' : 'Pending',
              style: textTheme.labelSmall?.copyWith(
                color: taken ? AppColors.onSecondaryContainer : AppColors.error,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MedPlanBanner extends StatelessWidget {
  const _MedPlanBanner({required this.active});

  final bool active;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

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
              child: const Icon(Icons.verified_outlined, color: AppColors.onSecondaryContainer),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(active ? 'MedPlan Active' : 'No Active MedPlan',
                      style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                  Text(
                    active
                        ? 'This prescription is fully covered by your TreatRyte plan.'
                        : 'You have no active medications on file.',
                    style: textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            TextButton(onPressed: () {}, child: const Text('Details')),
          ],
        ),
      ),
    );
  }
}
