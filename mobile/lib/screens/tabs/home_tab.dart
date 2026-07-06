import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../providers/activity_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/main_tab_provider.dart';
import '../../providers/wallet_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/icon_mapper.dart';

class HomeTab extends StatefulWidget {
  const HomeTab({super.key});

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<WalletProvider>().refresh();
      context.read<ActivityProvider>().refresh();
    });
  }

  @override
  Widget build(BuildContext context) {
    final wallet = context.watch<WalletProvider>();
    final activity = context.watch<ActivityProvider>();

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => Future.wait([
          context.read<WalletProvider>().refresh(),
          context.read<ActivityProvider>().refresh(),
        ]),
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
              const _DashboardHeader(),
              const SizedBox(height: AppSpacing.lg),
              _WalletCard(wallet: wallet),
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
              if (activity.isLoading && activity.recent.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: AppSpacing.lg),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (activity.recent.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                  child: Text('No recent activity yet.', style: Theme.of(context).textTheme.bodySmall),
                )
              else
                for (final item in activity.recent)
                  _ActivityTile(
                    icon: iconForKey(item.iconKey),
                    iconColor: AppColors.secondary,
                    iconBackground: AppColors.secondaryContainer,
                    title: item.title,
                    subtitle: item.subtitle,
                  ),
              const SizedBox(height: AppSpacing.lg),
              const _InsuranceBanner(),
            ],
          ),
        ),
      ),
    );
  }
}

class _DashboardHeader extends StatelessWidget {
  const _DashboardHeader();

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final user = context.watch<AuthProvider>().currentUser;

    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Hello, ${user?.firstName ?? ''} 👋', style: textTheme.headlineMedium),
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
  const _WalletCard({required this.wallet});

  final WalletProvider wallet;

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
          wallet.isLoading
              ? const SizedBox(
                  height: 34,
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    ),
                  ),
                )
              : Text(
                  wallet.formattedBalance,
                  style: const TextStyle(
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

  // tabIndex refers to MainShell's patient tab order: Home, Vault, Directory, Meds.
  static const _services = [
    (
      icon: Icons.folder_shared_outlined,
      label: 'Medical Vault',
      color: AppColors.secondaryContainer,
      onColor: AppColors.onSecondaryContainer,
      tabIndex: 1,
    ),
    (
      icon: Icons.biotech_outlined,
      label: 'Find Labs',
      color: Color(0xFFDAE2FD),
      onColor: AppColors.tertiary,
      tabIndex: 2,
    ),
    (
      icon: Icons.alarm,
      label: 'Med Alarms',
      color: AppColors.errorContainer,
      onColor: AppColors.error,
      tabIndex: 3,
    ),
    (
      icon: Icons.share_outlined,
      label: 'Share Records',
      color: Color(0xFFE0E3E5),
      onColor: AppColors.onSurfaceVariant,
      tabIndex: 1,
    ),
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
            child: InkWell(
              borderRadius: BorderRadius.circular(AppRadii.md),
              onTap: () => context.read<MainTabProvider>().setIndex(service.tabIndex),
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
            onPressed: () => context.push('/subscription-plans'),
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
