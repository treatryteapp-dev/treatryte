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
      note: _notesController.text.trim().isEmpty
          ? null
          : _notesController.text.trim(),
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
        medications.nextDose?.doseLogId ??
        (medications.schedule.isNotEmpty
            ? medications.schedule.last.doseLogId
            : null);

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
              else if (medications.schedule.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppSpacing.xl),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerLowest,
                    borderRadius: BorderRadius.circular(AppRadii.lg),
                    border: Border.all(color: AppColors.outlineVariant),
                  ),
                  child: Column(
                    children: [
                      const Icon(
                        Icons.medication_outlined,
                        size: 48,
                        color: AppColors.onSurfaceVariant,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Text(
                        'No Meds for Today',
                        style: textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'You have no active prescriptions or medications scheduled for today.',
                        textAlign: TextAlign.center,
                        style: textTheme.bodySmall,
                      ),
                    ],
                  ),
                )
              else
                _GroupedPrescriptionAlarmCard(schedule: medications.schedule),
              const SizedBox(height: AppSpacing.xl),
              Text('Feedback Log', style: textTheme.headlineSmall),
              const SizedBox(height: 4),
              Text(
                'How are you feeling after your dose?',
                style: textTheme.bodySmall,
              ),
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
                      onSelected: (_) =>
                          setState(() => _selectedMood = mood.label),
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
                  hintText:
                      'Additional notes (e.g., Slightly dizzy but manageable)',
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed:
                      (_selectedMood != null &&
                          feedbackTargetId != null &&
                          !_submittingFeedback)
                      ? () => _submitFeedback(feedbackTargetId)
                      : null,
                  child: _submittingFeedback
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
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

class _GroupedPrescriptionAlarmCard extends StatefulWidget {
  const _GroupedPrescriptionAlarmCard({required this.schedule});
  final List<DoseScheduleItem> schedule;

  @override
  State<_GroupedPrescriptionAlarmCard> createState() => _GroupedPrescriptionAlarmCardState();
}

class _GroupedPrescriptionAlarmCardState extends State<_GroupedPrescriptionAlarmCard> {
  bool _expanded = false;
  bool _logging = false;
  bool _askingConfirmation = false;
  Timer? _countdownTimer;
  Duration _timeUntilMidnight = Duration.zero;

  @override
  void initState() {
    super.initState();
    _updateCountdown();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) => _updateCountdown());
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _updateCountdown() {
    final now = DateTime.now();
    final midnight = DateTime(now.year, now.month, now.day + 1);
    final diff = midnight.difference(now);
    if (mounted) {
      setState(() => _timeUntilMidnight = diff.isNegative ? Duration.zero : diff);
    }
  }

  String get _formattedCountdown {
    final hours = _timeUntilMidnight.inHours.toString().padLeft(2, '0');
    final minutes = (_timeUntilMidnight.inMinutes % 60).toString().padLeft(2, '0');
    final seconds = (_timeUntilMidnight.inSeconds % 60).toString().padLeft(2, '0');
    return '$hours:$minutes:$seconds';
  }

  String _ordinal(int n) {
    if (n % 100 >= 11 && n % 100 <= 13) return '${n}th';
    switch (n % 10) {
      case 1: return '${n}st';
      case 2: return '${n}nd';
      case 3: return '${n}rd';
      default: return '${n}th';
    }
  }

  void _showCelebrationDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Center(
        child: Material(
          color: Colors.transparent,
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 40),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 20)],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('🎉 🎊 ❤️ 💖 💕 ✨', style: TextStyle(fontSize: 32)),
                const SizedBox(height: 16),
                const Text('Awesome Job!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary)),
                const SizedBox(height: 8),
                const Text('You logged your dose for today! Keep up the great streak!', textAlign: TextAlign.center, style: TextStyle(fontSize: 14)),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(ctx).pop(),
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                    child: const Text('Continue 💖'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _confirmAndLogDose(DoseScheduleItem dose) async {
    setState(() => _logging = true);
    try {
      await context.read<MedicationProvider>().logDose(dose.doseLogId);
      if (!mounted) return;
      setState(() {
        _logging = false;
        _askingConfirmation = false;
      });
      _showCelebrationDialog(context);
    } catch (e) {
      if (mounted) setState(() => _logging = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pendingDoses = widget.schedule.where((d) => d.status == 'pending').toList();
    final takenDoses = widget.schedule.where((d) => d.status == 'taken').toList();
    final allDone = pendingDoses.isEmpty;
    final nextIndex = takenDoses.length + 1;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primaryContainer, AppColors.primary],
        ),
        borderRadius: BorderRadius.circular(AppRadii.lg),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white24,
                        borderRadius: BorderRadius.circular(AppRadii.full),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.alarm, color: Colors.white, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            allDone ? 'ALL COMPLETED' : 'ACTIVE PRESCRIPTION ALARM',
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                    ),
                    InkWell(
                      onTap: () => setState(() => _expanded = !_expanded),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              _expanded ? 'Hide Drugs' : 'View Prescription Drugs (${widget.schedule.length})',
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(width: 4),
                            Icon(_expanded ? Icons.expand_less : Icons.expand_more, color: Colors.white, size: 16),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                if (allDone) ...[
                  const Text(
                    'All Medications Taken for Today! 🎉',
                    style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Great job adhering to your prescription plan. Next cycle resets in:',
                    style: TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    _formattedCountdown,
                    style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w700, letterSpacing: 2),
                  ),
                ] else ...[
                  Text(
                    pendingDoses.first.medicationName,
                    style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700),
                  ),
                  Text(
                    'Dosage: ${pendingDoses.first.dosage} • Dose ${_ordinal(nextIndex)} of ${widget.schedule.length}',
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  if (!_askingConfirmation)
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () => setState(() => _askingConfirmation = true),
                        icon: const Icon(Icons.check_circle_outline),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppColors.primary,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        label: Text(
                          'Have you taken your ${_ordinal(nextIndex)} medication for today?',
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                        ),
                      ),
                    )
                  else ...[
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(AppRadii.md),
                      ),
                      child: Column(
                        children: [
                          Text(
                            'Confirm: Have you taken your ${_ordinal(nextIndex)} medication (${pendingDoses.first.medicationName}) for today?',
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: AppSpacing.md),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: _logging ? null : () => setState(() => _askingConfirmation = false),
                                  style: OutlinedButton.styleFrom(foregroundColor: Colors.white, side: const BorderSide(color: Colors.white54)),
                                  child: const Text('No / Not Yet'),
                                ),
                              ),
                              const SizedBox(width: AppSpacing.sm),
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: _logging ? null : () => _confirmAndLogDose(pendingDoses.first),
                                  style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppColors.primary),
                                  child: _logging
                                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                                      : const Text('Yes, I Have! ❤️', style: TextStyle(fontWeight: FontWeight.bold)),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ],
            ),
          ),
          if (_expanded) ...[
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Prescription Drugs Schedule', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.onSurface)),
                  const SizedBox(height: AppSpacing.sm),
                  for (final dose in widget.schedule)
                    _DoseTile(dose: dose),
                ],
              ),
            ),
          ],
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
    final time = TimeOfDay.fromDateTime(
      dose.scheduledFor.toLocal(),
    ).format(context);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: taken
                  ? AppColors.secondaryContainer
                  : AppColors.errorContainer,
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
                Text(
                  dose.medicationName,
                  style: textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(time, style: textTheme.bodySmall),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: 4,
            ),
            decoration: BoxDecoration(
              color: taken
                  ? AppColors.secondaryContainer
                  : AppColors.errorContainer,
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
              child: const Icon(
                Icons.verified_outlined,
                color: AppColors.onSecondaryContainer,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    active ? 'MedPlan Active' : 'No Active MedPlan',
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
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
