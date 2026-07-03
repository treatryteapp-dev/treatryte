import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class PartnerServicesTab extends StatelessWidget {
  const PartnerServicesTab({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Service & Pricing', style: textTheme.headlineSmall),
            const SizedBox(height: 2),
            Text('Manage your diagnostic and clinical services. Update pricing and availability in real-time.', style: textTheme.bodySmall),
            const SizedBox(height: AppSpacing.lg),

            // Average service price indicator
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.secondary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppRadii.lg),
                border: Border.all(color: AppColors.secondary.withValues(alpha: 0.2)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.trending_up, color: AppColors.secondary),
                  SizedBox(width: AppSpacing.md),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Average Service Price',
                        style: TextStyle(color: AppColors.onSecondaryContainer, fontSize: 12),
                      ),
                      Text(
                        '₦14,500',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.onSecondaryContainer),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // Search and Add
            Row(
              children: [
                const Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Search services...',
                      prefixIcon: Icon(Icons.search, color: AppColors.outline),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                IconButton.filled(
                  onPressed: () {},
                  icon: const Icon(Icons.add),
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadii.lg)),
                    minimumSize: const Size(56, 56),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),

            // Service items
            _buildServiceItem(context, title: 'Blood Test (Full Count)', category: 'Diagnostic', price: '₦12,500'),
            const Divider(),
            _buildServiceItem(context, title: 'Malaria Test (Smear)', category: 'Infectious Disease', price: '₦4,500'),
            const Divider(),
            _buildServiceItem(context, title: 'CT Scan (Brain)', category: 'Imaging', price: '₦75,000'),
            const Divider(),
            _buildServiceItem(context, title: 'Ultrasound (Abdomen)', category: 'Imaging', price: '₦22,000'),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceItem(
    BuildContext context, {
    required String title,
    required String category,
    required String price,
  }) {
    final textTheme = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
              Text(category, style: textTheme.bodySmall),
            ],
          ),
          Row(
            children: [
              Text(
                price,
                style: textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              const Icon(Icons.chevron_right, color: AppColors.outline),
            ],
          )
        ],
      ),
    );
  }
}
