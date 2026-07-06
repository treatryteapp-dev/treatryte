import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/plan_models.dart';
import '../../providers/partner_provider.dart';
import '../../providers/plan_provider.dart';
import '../../theme/app_theme.dart';

class PartnerPlansTab extends StatefulWidget {
  const PartnerPlansTab({super.key});

  @override
  State<PartnerPlansTab> createState() => _PartnerPlansTabState();
}

class _PartnerPlansTabState extends State<PartnerPlansTab> {
  bool _loaded = false;
  bool _switching = false;

  @override
  Widget build(BuildContext context) {
    if (!_loaded) {
      _loaded = true;
      final provider = context.read<PlanProvider>();
      Future.microtask(() => provider.loadPlans(type: 'Partner'));
    }

    final textTheme = Theme.of(context).textTheme;
    final planProvider = context.watch<PlanProvider>();
    final partnerProvider = context.watch<PartnerProvider>();
    final currentPlan = partnerProvider.plan;

    return Stack(
      children: [
        SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Header ──────────────────────────────────────────────
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primaryContainer.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppRadii.full),
                  ),
                  child: Text(
                    'PARTNER SUBSCRIPTIONS',
                    style: textTheme.labelSmall?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  'Scale Your Practice with Precision',
                  style: textTheme.headlineMedium,
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  'Choose a plan that fits your clinical operations. Manage patients, services, and billing through our secure medical-fintech ecosystem.',
                  style: textTheme.bodySmall,
                ),
                const SizedBox(height: AppSpacing.lg),

                // ── Current Plan Banner ──────────────────────────────────
                if (currentPlan != null) ...[
                  _CurrentPlanBanner(plan: currentPlan),
                  const SizedBox(height: AppSpacing.xl),
                ],

                // ── Plan List ────────────────────────────────────────────
                if (planProvider.isLoading)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(AppSpacing.xl),
                      child: CircularProgressIndicator(),
                    ),
                  )
                else if (planProvider.plans.isEmpty)
                  Text(
                    'No partner plans are configured yet.',
                    style: textTheme.bodySmall,
                  )
                else
                  for (final plan in planProvider.plans) ...[
                    _buildPlanCard(plan, isActive: plan.id == currentPlan?.id),
                    const SizedBox(height: AppSpacing.md),
                  ],
              ],
            ),
          ),
        ),

        // ── Full-screen loading overlay while switching ───────────────────
        if (_switching)
          Container(
            color: Colors.black.withValues(alpha: 0.35),
            child: const Center(
              child: Card(
                child: Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: AppSpacing.xl,
                    vertical: AppSpacing.lg,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(),
                      SizedBox(height: AppSpacing.md),
                      Text(
                        'Switching plan…',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  Future<void> _selectPlan(Plan plan) async {
    if (_switching) return; // Guard double-tap.
    setState(() => _switching = true);
    final planProvider = context.read<PlanProvider>();
    final partnerProvider = context.read<PartnerProvider>();
    final ok = await planProvider.selectPlan(plan.id);
    if (ok) {
      await partnerProvider.loadProfile();
    }
    if (!mounted) return;
    setState(() => _switching = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          ok ? 'Switched to ${plan.name}.' : 'Failed to switch plans. Please try again.',
        ),
      ),
    );
  }

  Widget _buildPlanCard(Plan plan, {required bool isActive}) {
    final textTheme = Theme.of(context).textTheme;
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadii.lg),
        side: BorderSide(
          color: isActive
              ? AppColors.primary
              : AppColors.outlineVariant.withValues(alpha: 0.3),
          width: isActive ? 2 : 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(plan.name, style: textTheme.headlineSmall),
                ),
                if (isActive)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primaryContainer.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(AppRadii.full),
                      border: Border.all(color: AppColors.primary),
                    ),
                    child: const Text(
                      'ACTIVE',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              plan.price == 0
                  ? '₦0 / Free'
                  : '₦${plan.price.toStringAsFixed(0)}/${plan.interval}',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            if (plan.transactionSplit > 0) ...[
              const SizedBox(height: 4),
              Text(
                '${plan.transactionSplit}% Nomba transaction fee',
                style: textTheme.bodySmall,
              ),
            ],
            const Divider(height: AppSpacing.lg),
            ...plan.features.map(
              (feature) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4.0),
                child: Row(
                  children: [
                    const Icon(
                      Icons.check,
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
            ),
            const SizedBox(height: AppSpacing.lg),
            ElevatedButton(
              onPressed: isActive || _switching ? null : () => _selectPlan(plan),
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    isActive ? AppColors.secondaryContainer : AppColors.primary,
                foregroundColor:
                    isActive ? AppColors.onSecondaryContainer : Colors.white,
                minimumSize: const Size.fromHeight(48),
              ),
              child: Text(isActive ? 'Current Plan' : 'Switch to This Plan'),
            ),
          ],
        ),
      ),
    );
  }
}

/// Banner shown at the top of the plans screen summarising the active plan.
class _CurrentPlanBanner extends StatelessWidget {
  const _CurrentPlanBanner({required this.plan});
  final Plan plan;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.secondaryContainer.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AppRadii.lg),
        border: Border.all(
          color: AppColors.secondary.withValues(alpha: 0.4),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: AppColors.secondary.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.workspace_premium,
              color: AppColors.secondary,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your Current Plan',
                  style: textTheme.labelSmall?.copyWith(
                    color: AppColors.onSurfaceVariant,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  plan.name,
                  style: textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.onBackground,
                  ),
                ),
                if (plan.price > 0)
                  Text(
                    '₦${plan.price.toStringAsFixed(0)} / ${plan.interval}',
                    style: textTheme.bodySmall?.copyWith(
                      color: AppColors.secondary,
                      fontWeight: FontWeight.w600,
                    ),
                  )
                else
                  Text(
                    'Free plan',
                    style: textTheme.bodySmall?.copyWith(
                      color: AppColors.secondary,
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
