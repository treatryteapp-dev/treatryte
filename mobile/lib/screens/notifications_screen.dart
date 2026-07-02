import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_theme.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  static const _today = [
    (
      icon: Icons.medication_outlined,
      iconColor: AppColors.error,
      iconBackground: AppColors.errorContainer,
      title: 'Medication Reminder',
      body: 'It\'s time to take your Amoxicillin 500mg dose.',
      time: '2:00 PM',
    ),
    (
      icon: Icons.account_balance_wallet_outlined,
      iconColor: AppColors.secondary,
      iconBackground: AppColors.secondaryContainer,
      title: 'Wallet Funded',
      body: '₦10,000.00 has been credited to your wallet.',
      time: '10:15 AM',
    ),
  ];

  static const _yesterday = [
    (
      icon: Icons.science_outlined,
      iconColor: AppColors.primary,
      iconBackground: AppColors.primaryContainer,
      title: 'Lab Results Ready',
      body: 'Your General Diagnostics results are now in your vault.',
      time: '4:45 PM',
    ),
    (
      icon: Icons.event_available_outlined,
      iconColor: AppColors.tertiary,
      iconBackground: Color(0xFFDAE2FD),
      title: 'Appointment Confirmed',
      body: 'Your booking at Care Diagnostics Lab is confirmed for tomorrow.',
      time: '11:00 AM',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Notifications'),
        actions: [
          TextButton(onPressed: () {}, child: const Text('Clear All')),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            _SectionLabel('TODAY'),
            for (final n in _today)
              _NotificationTile(
                icon: n.icon,
                iconColor: n.iconColor,
                iconBackground: n.iconBackground,
                title: n.title,
                body: n.body,
                time: n.time,
              ),
            const SizedBox(height: AppSpacing.md),
            _SectionLabel('YESTERDAY'),
            for (final n in _yesterday)
              _NotificationTile(
                icon: n.icon,
                iconColor: n.iconColor,
                iconBackground: n.iconBackground,
                title: n.title,
                body: n.body,
                time: n.time,
              ),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Text(label, style: Theme.of(context).textTheme.labelSmall),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({
    required this.icon,
    required this.iconColor,
    required this.iconBackground,
    required this.title,
    required this.body,
    required this.time,
  });

  final IconData icon;
  final Color iconColor;
  final Color iconBackground;
  final String title;
  final String body;
  final String time;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: iconBackground,
                borderRadius: BorderRadius.circular(AppRadii.md),
              ),
              child: Icon(icon, size: 20, color: iconColor),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                        ),
                      ),
                      Text(time, style: textTheme.bodySmall),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(body, style: textTheme.bodySmall),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
