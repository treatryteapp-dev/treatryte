import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/plan_models.dart';
import '../providers/auth_provider.dart';
import '../providers/plan_provider.dart';
import '../providers/subscription_provider.dart';
import '../theme/app_theme.dart';

class SubscriptionPlansScreen extends StatefulWidget {
  const SubscriptionPlansScreen({super.key});

  @override
  State<SubscriptionPlansScreen> createState() =>
      _SubscriptionPlansScreenState();
}

class _SubscriptionPlansScreenState extends State<SubscriptionPlansScreen> {
  bool _loaded = false;
  String? _selectedPlanId;
  bool _switching = false;

  @override
  Widget build(BuildContext context) {
    if (!_loaded) {
      _loaded = true;
      final provider = context.read<PlanProvider>();
      Future.microtask(() => provider.loadPlans(type: 'Individual'));
    }

    final textTheme = Theme.of(context).textTheme;
    final planProvider = context.watch<PlanProvider>();
    final currentPlanId = context.watch<AuthProvider>().currentUser?.planId;
    _selectedPlanId ??= currentPlanId;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Upgrade your Coverage'),
      ),
      body: SafeArea(
        child: planProvider.isLoading
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: () async {
                  await context.read<PlanProvider>().loadPlans(
                    type: 'Individual',
                  );
                  await context.read<AuthProvider>().checkSession();
                },
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Select a plan that fits your healthcare needs',
                        style: textTheme.bodyMedium,
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      if (planProvider.plans.isEmpty)
                        Text(
                          'No plans are available right now.',
                          style: textTheme.bodySmall,
                        )
                      else
                        for (final plan in planProvider.plans) ...[
                          _PlanCard(
                            plan: plan,
                            selected: plan.id == _selectedPlanId,
                            isCurrent: plan.id == currentPlanId,
                            onTap: () =>
                                setState(() => _selectedPlanId = plan.id),
                          ),
                          const SizedBox(height: AppSpacing.md),
                        ],
                      const SizedBox(height: AppSpacing.sm),
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceContainerLow,
                          borderRadius: BorderRadius.circular(AppRadii.lg),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(
                              Icons.shield_outlined,
                              size: 18,
                              color: AppColors.secondary,
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: Text.rich(
                                TextSpan(
                                  style: textTheme.bodySmall,
                                  children: const [
                                    TextSpan(
                                      text:
                                          'Your medical history and data are encrypted with '
                                          'bank-grade security protocols. ',
                                    ),
                                    TextSpan(
                                      text: 'Learn more about our security.',
                                      style: TextStyle(
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      if (planProvider.plans.isNotEmpty)
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed:
                                (_selectedPlanId == null ||
                                    _selectedPlanId == currentPlanId ||
                                    _switching)
                                ? null
                                : _confirmSelection,
                            child: Text(
                              _selectedPlanId == currentPlanId
                                  ? 'Current Plan'
                                  : 'Confirm Selection',
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  Future<void> _confirmSelection() async {
    if (_selectedPlanId == null) return;
    final planProvider = context.read<PlanProvider>();
    final selectedPlan = planProvider.plans.firstWhere(
      (p) => p.id == _selectedPlanId,
    );

    setState(() => _switching = true);

    if (selectedPlan.price <= 0) {
      final ok = await planProvider.selectPlan(_selectedPlanId!);
      if (ok) {
        await context.read<AuthProvider>().checkSession();
      }
      if (!mounted) return;
      setState(() => _switching = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(ok ? 'Plan updated.' : 'Failed to update your plan.'),
        ),
      );
      return;
    }

    final checkoutLink = await context.read<SubscriptionProvider>().upgrade(
      _selectedPlanId!,
    );
    if (!mounted) return;
    setState(() => _switching = false);

    if (checkoutLink == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to start checkout for this plan.'),
        ),
      );
      return;
    }

    final uri = Uri.parse(checkoutLink);
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!mounted) return;
    if (!opened) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open the payment page.')),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Complete payment in the browser, then come back and pull to refresh.',
        ),
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({
    required this.plan,
    required this.selected,
    required this.isCurrent,
    required this.onTap,
  });

  final Plan plan;
  final bool selected;
  final bool isCurrent;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadii.lg),
        side: BorderSide(
          color: selected ? AppColors.primary : AppColors.outlineVariant,
          width: selected ? 2 : 1,
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadii.lg),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Text(plan.name, style: textTheme.headlineSmall),
                        if (isCurrent) ...[
                          const SizedBox(width: AppSpacing.sm),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.sm,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.secondaryContainer,
                              borderRadius: BorderRadius.circular(
                                AppRadii.full,
                              ),
                            ),
                            child: Text(
                              'CURRENT',
                              style: textTheme.labelSmall?.copyWith(
                                color: AppColors.onSecondaryContainer,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  Icon(
                    selected
                        ? Icons.radio_button_checked
                        : Icons.radio_button_unchecked,
                    color: selected ? AppColors.primary : AppColors.outline,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    plan.price == 0
                        ? '₦0'
                        : '₦${plan.price.toStringAsFixed(0)}',
                    style: textTheme.headlineMedium?.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 4, bottom: 4),
                    child: Text(
                      '/${plan.interval}',
                      style: textTheme.bodySmall,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              for (final feature in plan.features)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 3),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.check_circle,
                        size: 16,
                        color: AppColors.secondary,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Text(feature, style: textTheme.bodySmall),
                      ),
                    ],
                  ),
                ),
              for (final feature in plan.excludedFeatures)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 3),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.cancel_outlined,
                        size: 16,
                        color: AppColors.outline,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Text(
                          feature,
                          style: textTheme.bodySmall?.copyWith(
                            color: AppColors.outline,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
