import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class PartnerPlansTab extends StatefulWidget {
  const PartnerPlansTab({super.key});

  @override
  State<PartnerPlansTab> createState() => _PartnerPlansTabState();
}

class _PartnerPlansTabState extends State<PartnerPlansTab> {
  bool _isAnnual = true;
  String _activePlan = 'Standard';

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

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

            // Toggle Monthly/Annual
            Center(
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(AppRadii.lg),
                ),
                padding: const EdgeInsets.all(4),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildToggleBtn('Monthly', !_isAnnual),
                    _buildToggleBtn('Annual (Save 15%)', _isAnnual),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            // Free Plan Card
            _buildPlanCard(
              title: 'Free',
              price: '₦0',
              subtitle: 'For new practitioners starting out',
              features: [
                '1-100 Patients Registry',
                'No Managed Services',
                'Basic Medical Records',
                'Email Support',
              ],
              isActive: _activePlan == 'Free',
              onSelect: () => setState(() => _activePlan = 'Free'),
            ),
            const SizedBox(height: AppSpacing.md),

            // Standard Plan Card (Recommended)
            _buildPlanCard(
              title: 'Standard',
              price: _isAnnual ? '₦150,000/year' : '₦15,000/month',
              subtitle: 'For growing community clinics',
              features: [
                '101-500 Patients Registry',
                '5 Custom Managed Services',
                'Advanced Health Analytics',
                'Priority Chat Support',
                'Financial Settlement Reports',
              ],
              isRecommended: true,
              isActive: _activePlan == 'Standard',
              onSelect: () => setState(() => _activePlan = 'Standard'),
            ),
            const SizedBox(height: AppSpacing.md),

            // Premium Plan Card
            _buildPlanCard(
              title: 'Premium',
              price: 'Custom Pricing',
              subtitle: 'For multi-departmental hospitals',
              features: [
                'Unlimited Patients Registry',
                'Unlimited Managed Services',
                'Fully Custom API Access',
                'Dedicated Support Manager',
                'Instant Settlement Integration',
              ],
              isActive: _activePlan == 'Premium',
              onSelect: () => setState(() => _activePlan = 'Premium'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildToggleBtn(String label, bool active) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _isAnnual = label.contains('Annual');
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.surfaceContainerLowest : Colors.transparent,
          borderRadius: BorderRadius.circular(AppRadii.md),
          boxShadow: active
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  )
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: active ? AppColors.primary : AppColors.onSurfaceVariant,
          ),
        ),
      ),
    );
  }

  Widget _buildPlanCard({
    required String title,
    required String price,
    required String subtitle,
    required List<String> features,
    bool isRecommended = false,
    bool isActive = false,
    required VoidCallback onSelect,
  }) {
    final textTheme = Theme.of(context).textTheme;
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadii.lg),
        side: BorderSide(
          color: isRecommended ? AppColors.primary : AppColors.outlineVariant.withValues(alpha: 0.3),
          width: isRecommended ? 2 : 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (isRecommended)
              Container(
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(AppRadii.full),
                ),
                child: const Text(
                  'RECOMMENDED',
                  style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                ),
              ),
            Text(title, style: textTheme.headlineSmall),
            const SizedBox(height: 2),
            Text(subtitle, style: textTheme.bodySmall),
            const SizedBox(height: AppSpacing.md),
            Text(
              price,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.primary),
            ),
            const Divider(height: AppSpacing.lg),
            ...features.map((feature) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4.0),
                  child: Row(
                    children: [
                      const Icon(Icons.check, size: 16, color: AppColors.secondary),
                      const SizedBox(width: AppSpacing.sm),
                      Text(feature, style: textTheme.bodySmall),
                    ],
                  ),
                )),
            const SizedBox(height: AppSpacing.lg),
            ElevatedButton(
              onPressed: isActive ? null : onSelect,
              style: ElevatedButton.styleFrom(
                backgroundColor: isActive ? AppColors.secondaryContainer : AppColors.primary,
                foregroundColor: isActive ? AppColors.onSecondaryContainer : Colors.white,
                minimumSize: const Size.fromHeight(48),
              ),
              child: Text(isActive ? 'Current Plan' : 'Upgrade Plan'),
            ),
          ],
        ),
      ),
    );
  }
}
