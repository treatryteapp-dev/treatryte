import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/app_theme.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({super.key});

  @override
  Widget build(BuildContext context) {
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
          const _DashboardHeader(name: 'Adebayo'),
          const SizedBox(height: AppSpacing.lg),
          const _WalletCard(),
          const SizedBox(height: AppSpacing.xl),
          Text('Quick Services', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: AppSpacing.md),
          const _QuickServicesGrid(),
          const SizedBox(height: AppSpacing.xl),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Recent Activity', style: Theme.of(context).textTheme.headlineSmall),
              TextButton(onPressed: () {}, child: const Text('See All')),
            ],
          ),
          const _ActivityTile(
            icon: Icons.science_outlined,
            iconColor: AppColors.secondary,
            iconBackground: AppColors.secondaryContainer,
            title: 'Lab Results Uploaded',
            subtitle: 'General Diagnostics • Just now',
          ),
          const _ActivityTile(
            icon: Icons.medication_outlined,
            iconColor: AppColors.error,
            iconBackground: AppColors.errorContainer,
            title: 'Upcoming Medication',
            subtitle: 'Amoxicillin • 8:00 PM',
          ),
          const SizedBox(height: AppSpacing.lg),
          const _InsuranceBanner(),
        ],
        ),
      ),
    );
  }
}

class _DashboardHeader extends StatelessWidget {
  const _DashboardHeader({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Hello, $name 👋', style: textTheme.headlineMedium),
              const SizedBox(height: 2),
              Text('How are you feeling today?', style: textTheme.bodySmall),
            ],
          ),
        ),
        IconButton.filledTonal(
          onPressed: () => context.push('/notifications'),
          icon: const Icon(Icons.notifications_none),
        ),
        const SizedBox(width: AppSpacing.sm),
        const CircleAvatar(
          radius: 20,
          backgroundColor: AppColors.secondaryContainer,
          child: Icon(Icons.person, color: AppColors.onSecondaryContainer),
        ),
      ],
    );
  }
}

class _WalletCard extends StatelessWidget {
  const _WalletCard();

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

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
              const Icon(Icons.account_balance_wallet_outlined,
                  color: Colors.white70, size: 18),
              const SizedBox(width: AppSpacing.xs),
              Text(
                'NOMBA DIGITAL WALLET',
                style: textTheme.labelSmall?.copyWith(color: Colors.white70),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'Available Balance',
            style: TextStyle(color: Colors.white70, fontSize: 13),
          ),
          const Text(
            '₦45,000.00',
            style: TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => context.push('/fund-wallet'),
                  icon: const Icon(Icons.add, size: 16, color: Colors.white),
                  label: const Text('Fund Wallet'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white54),
                    minimumSize: const Size.fromHeight(44),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => context.push('/withdraw-pay'),
                  icon: const Icon(Icons.arrow_upward, size: 16),
                  label: const Text('Withdraw/Pay'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.primary,
                    minimumSize: const Size.fromHeight(44),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _QuickServicesGrid extends StatelessWidget {
  const _QuickServicesGrid();

  static const _services = [
    (icon: Icons.folder_shared_outlined, label: 'Medical Vault', color: AppColors.secondaryContainer, onColor: AppColors.onSecondaryContainer),
    (icon: Icons.biotech_outlined, label: 'Find Labs', color: Color(0xFFDAE2FD), onColor: AppColors.tertiary),
    (icon: Icons.alarm, label: 'Med Alarms', color: AppColors.errorContainer, onColor: AppColors.error),
    (icon: Icons.share_outlined, label: 'Share Records', color: Color(0xFFE0E3E5), onColor: AppColors.onSurfaceVariant),
  ];

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: AppSpacing.sm,
      crossAxisSpacing: AppSpacing.sm,
      childAspectRatio: 2.6,
      children: [
        for (final service in _services)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.sm),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: service.color,
                      borderRadius: BorderRadius.circular(AppRadii.sm),
                    ),
                    child: Icon(service.icon, size: 18, color: service.onColor),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      service.label,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.onSurface,
                          ),
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

class _ActivityTile extends StatelessWidget {
  const _ActivityTile({
    required this.icon,
    required this.iconColor,
    required this.iconBackground,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final Color iconColor;
  final Color iconBackground;
  final String title;
  final String subtitle;

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
                Text(title, style: textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.onSurface,
                )),
                Text(subtitle, style: textTheme.bodySmall),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: AppColors.outline),
        ],
      ),
    );
  }
}

class _InsuranceBanner extends StatelessWidget {
  const _InsuranceBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(AppRadii.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Stay Insured',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Renew your health insurance with MedFin to keep your vault '
            'active and secure.',
            style: TextStyle(color: Colors.white70, fontSize: 13),
          ),
          const SizedBox(height: AppSpacing.md),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: AppColors.primary,
              minimumSize: const Size(120, 44),
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            ),
            child: const Text('Renew Now'),
          ),
        ],
      ),
    );
  }
}
