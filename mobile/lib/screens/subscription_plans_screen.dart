import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_theme.dart';

class _Plan {
  const _Plan({
    required this.name,
    required this.tagline,
    required this.priceLabel,
    required this.features,
    this.badge,
  });

  final String name;
  final String tagline;
  final String priceLabel;
  final List<({String label, bool included})> features;
  final String? badge;
}

const _plans = [
  _Plan(
    name: 'Free',
    tagline: 'Basic medical exploration',
    priceLabel: '₦0',
    features: [
      (label: 'See partner medical centres near you', included: true),
      (label: 'Limited to 5 file uploads', included: true),
      (label: 'No partner booking/access', included: false),
    ],
  ),
  _Plan(
    name: 'Standard',
    tagline: 'Comprehensive personal care',
    priceLabel: '₦25,000',
    features: [
      (label: 'See partner medical centres near you', included: true),
      (label: 'Unlimited file uploads', included: true),
      (label: 'Access to booking with partner medical centres', included: true),
      (label: 'No shared family wallet', included: false),
    ],
  ),
  _Plan(
    name: 'Family Plan',
    tagline: 'Shared health security for all',
    priceLabel: '₦45,000',
    badge: 'BEST VALUE',
    features: [
      (label: 'See partner medical centres near you', included: true),
      (label: 'Unlimited file uploads', included: true),
      (label: 'Access to booking with partner medical centres', included: true),
      (label: 'Shared wallet for family members', included: true),
    ],
  ),
];

class SubscriptionPlansScreen extends StatefulWidget {
  const SubscriptionPlansScreen({super.key});

  @override
  State<SubscriptionPlansScreen> createState() => _SubscriptionPlansScreenState();
}

class _SubscriptionPlansScreenState extends State<SubscriptionPlansScreen> {
  int _selectedIndex = 1;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Upgrade your Coverage'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Select a plan that fits your healthcare needs',
                style: textTheme.bodyMedium,
              ),
              const SizedBox(height: AppSpacing.lg),
              for (var i = 0; i < _plans.length; i++) ...[
                _PlanCard(
                  plan: _plans[i],
                  selected: i == _selectedIndex,
                  onTap: () => setState(() => _selectedIndex = i),
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
                    const Icon(Icons.shield_outlined, size: 18, color: AppColors.secondary),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text.rich(
                        TextSpan(
                          style: textTheme.bodySmall,
                          children: const [
                            TextSpan(
                              text: 'Your medical history and data are encrypted with '
                                  'bank-grade security protocols. ',
                            ),
                            TextSpan(
                              text: 'Learn more about our security.',
                              style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('${_plans[_selectedIndex].name} plan checkout is coming soon.')),
                    );
                  },
                  child: Text('Continue with ${_plans[_selectedIndex].name}'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({required this.plan, required this.selected, required this.onTap});

  final _Plan plan;
  final bool selected;
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
                        if (plan.badge != null) ...[
                          const SizedBox(width: AppSpacing.sm),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.secondaryContainer,
                              borderRadius: BorderRadius.circular(AppRadii.full),
                            ),
                            child: Text(
                              plan.badge!,
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
                    selected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                    color: selected ? AppColors.primary : AppColors.outline,
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Text(plan.tagline, style: textTheme.bodySmall),
              const SizedBox(height: AppSpacing.sm),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    plan.priceLabel,
                    style: textTheme.headlineMedium?.copyWith(color: AppColors.primary),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 4, bottom: 4),
                    child: Text('/month', style: textTheme.bodySmall),
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
                      Icon(
                        feature.included ? Icons.check_circle : Icons.cancel_outlined,
                        size: 16,
                        color: feature.included ? AppColors.secondary : AppColors.outline,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Text(
                          feature.label,
                          style: textTheme.bodySmall?.copyWith(
                            color: feature.included ? AppColors.onSurface : AppColors.outline,
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
