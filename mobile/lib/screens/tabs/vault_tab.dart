import 'package:flutter/material.dart';

import '../../theme/app_theme.dart';

class VaultTab extends StatelessWidget {
  const VaultTab({super.key});

  static const _directories = [
    (icon: Icons.favorite_border, label: 'Cardiology', color: AppColors.errorContainer, onColor: AppColors.error, count: '12 Files'),
    (icon: Icons.science_outlined, label: 'General Diagnostics', color: AppColors.secondaryContainer, onColor: AppColors.onSecondaryContainer, count: '28 Files'),
    (icon: Icons.medication_outlined, label: 'Prescriptions', color: Color(0xFFDAE2FD), onColor: AppColors.tertiary, count: '19 Files'),
    (icon: Icons.remove_red_eye_outlined, label: 'Eye Clinic', color: Color(0xFFE0E3E5), onColor: AppColors.onSurfaceVariant, count: '5 Files'),
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
            Text('Medical Vault', style: textTheme.headlineMedium),
            const SizedBox(height: AppSpacing.md),
            const TextField(
              decoration: InputDecoration(
                hintText: 'Search medical records, diagnosis...',
                prefixIcon: Icon(Icons.search),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            const _StorageBanner(),
            const SizedBox(height: AppSpacing.xl),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Directories', style: textTheme.headlineSmall),
                TextButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.swap_vert, size: 18),
                  label: const Text('Sort by'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            for (final directory in _directories)
              Card(
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.xs,
                  ),
                  leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: directory.color,
                      borderRadius: BorderRadius.circular(AppRadii.md),
                    ),
                    child: Icon(directory.icon, size: 20, color: directory.onColor),
                  ),
                  title: Text(
                    directory.label,
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.onSurface,
                    ),
                  ),
                  subtitle: Text(directory.count, style: textTheme.bodySmall),
                  trailing: const Icon(Icons.chevron_right, color: AppColors.outline),
                ),
              ),
            const SizedBox(height: AppSpacing.lg),
            const _BiometricLockBanner(),
          ],
        ),
      ),
    );
  }
}

class _StorageBanner extends StatelessWidget {
  const _StorageBanner();

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
          Row(
            children: [
              const Icon(Icons.shield_outlined, color: Colors.white, size: 18),
              const SizedBox(width: AppSpacing.xs),
              const Text(
                'Your Health Vault is Secure',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          const Text(
            'All documents are encrypted with bank-grade AES-256 encryption.',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: AppSpacing.md),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadii.full),
            child: const LinearProgressIndicator(
              value: 0.15,
              minHeight: 6,
              backgroundColor: Colors.white24,
              valueColor: AlwaysStoppedAnimation(Colors.white),
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          const Text(
            '1.2 GB / 8 GB • 64 Files',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _BiometricLockBanner extends StatelessWidget {
  const _BiometricLockBanner();

  @override
  Widget build(BuildContext context) {
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
              child: const Icon(Icons.fingerprint,
                  color: AppColors.onSecondaryContainer),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Enable Biometric Lock',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          )),
                  Text(
                    'Add an extra layer of protection to your vault.',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            Switch(value: false, onChanged: (_) {}, activeThumbColor: AppColors.primary),
          ],
        ),
      ),
    );
  }
}
