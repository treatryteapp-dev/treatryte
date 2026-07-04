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
    final currentPlanId = context.watch<PartnerProvider>().plan?.id;

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primaryContainer.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppRadii.full),
              ),
              child: Text(
                'PARTNER SUBSCRIPTIONS',
                style: textTheme.labelSmall?.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text('Scale Your Practice with Precision', style: textTheme.headlineMedium),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Choose a plan that fits your clinical operations. Manage patients, services, and billing through our secure medical-fintech ecosystem.',
              style: textTheme.bodySmall,
            ),
            const SizedBox(height: AppSpacing.xl),

            if (planProvider.isLoading)
              const Center(child: Padding(padding: EdgeInsets.all(AppSpacing.xl), child: CircularProgressIndicator()))
            else if (planProvider.plans.isEmpty)
              Text('No partner plans are configured yet.', style: textTheme.bodySmall)
            else
              for (final plan in planProvider.plans) ...[
                _buildPlanCard(plan, isActive: plan.id == currentPlanId),
                const SizedBox(height: AppSpacing.md),
              ],
          ],
        ),
      ),
    );
  }

  Future<void> _selectPlan(Plan plan) async {
    setState(() => _switching = true);
    final ok = await context.read<PlanProvider>().selectPlan(plan.id);
    if (ok) {
      await context.read<PartnerProvider>().loadProfile();
    }
    if (!mounted) return;
    setState(() => _switching = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(ok ? 'Switched to ${plan.name}.' : 'Failed to switch plans.')),
    );
  }

  Widget _buildPlanCard(Plan plan, {required bool isActive}) {
    final textTheme = Theme.of(context).textTheme;
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadii.lg),
        side: BorderSide(
          color: isActive ? AppColors.primary : AppColors.outlineVariant.withValues(alpha: 0.3),
          width: isActive ? 2 : 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(plan.name, style: textTheme.headlineSmall),
            const SizedBox(height: AppSpacing.md),
            Text(
              plan.price == 0 ? '₦0' : '₦${plan.price.toStringAsFixed(0)}/${plan.interval}',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.primary),
            ),
            if (plan.transactionSplit > 0) ...[
              const SizedBox(height: 4),
              Text('${plan.transactionSplit}% Nomba transaction fee', style: textTheme.bodySmall),
            ],
            const Divider(height: AppSpacing.lg),
            ...plan.features.map((feature) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4.0),
                  child: Row(
                    children: [
                      const Icon(Icons.check, size: 16, color: AppColors.secondary),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(child: Text(feature, style: textTheme.bodySmall)),
                    ],
                  ),
                )),
            const SizedBox(height: AppSpacing.lg),
            ElevatedButton(
              onPressed: isActive || _switching ? null : () => _selectPlan(plan),
              style: ElevatedButton.styleFrom(
                backgroundColor: isActive ? AppColors.secondaryContainer : AppColors.primary,
                foregroundColor: isActive ? AppColors.onSecondaryContainer : Colors.white,
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
