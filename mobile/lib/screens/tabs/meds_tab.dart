import 'package:flutter/material.dart';

import '../../theme/app_theme.dart';

class MedsTab extends StatefulWidget {
  const MedsTab({super.key});

  @override
  State<MedsTab> createState() => _MedsTabState();
}

class _MedsTabState extends State<MedsTab> {
  String? _selectedMood;

  static const _schedule = [
    (name: 'Vitamin D3', time: '8:00 AM', status: 'Taken', taken: true),
    (name: 'Amoxicillin 500mg', time: '2:00 PM', status: 'Pending', taken: false),
    (name: 'Loratadine 10mg', time: '9:00 PM', status: 'Taken', taken: true),
  ];

  static const _moods = [
    (icon: Icons.sentiment_satisfied_alt, label: 'Feeling well'),
    (icon: Icons.sick_outlined, label: 'Mild nausea'),
    (icon: Icons.bedtime_outlined, label: 'Fatigue'),
  ];

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return SafeArea(
      child: SingleChildScrollView(
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
            const _ActiveMedicationCard(),
            const SizedBox(height: AppSpacing.xl),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text("Today's Schedule", style: textTheme.headlineSmall),
                TextButton(onPressed: () {}, child: const Text('View History')),
              ],
            ),
            for (final dose in _schedule)
              _DoseTile(
                name: dose.name,
                time: dose.time,
                status: dose.status,
                taken: dose.taken,
              ),
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
            const TextField(
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Additional notes (e.g., Slightly dizzy but manageable)',
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {},
                child: const Text('Submit to Doctor'),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            const _MedPlanBanner(),
          ],
        ),
      ),
    );
  }
}

class _ActiveMedicationCard extends StatelessWidget {
  const _ActiveMedicationCard();

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
          const Text(
            'Amoxicillin 500mg',
            style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700),
          ),
          const Text(
            'Take 1 capsule with water after meal.',
            style: TextStyle(color: Colors.white70, fontSize: 13),
          ),
          const SizedBox(height: AppSpacing.md),
          const Text(
            '01:58:37',
            style: TextStyle(
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
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AppColors.primary,
              ),
              child: const Text('Log Dose'),
            ),
          ),
        ],
      ),
    );
  }
}

class _DoseTile extends StatelessWidget {
  const _DoseTile({
    required this.name,
    required this.time,
    required this.status,
    required this.taken,
  });

  final String name;
  final String time;
  final String status;
  final bool taken;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

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
                Text(name, style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
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
              status,
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
  const _MedPlanBanner();

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
                  Text('MedPlan Active', style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                  Text(
                    'This prescription is fully covered by your TreatRyte plan.',
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
