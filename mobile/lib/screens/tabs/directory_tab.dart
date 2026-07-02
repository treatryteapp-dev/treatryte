import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/app_theme.dart';

class DirectoryTab extends StatefulWidget {
  const DirectoryTab({super.key});

  @override
  State<DirectoryTab> createState() => _DirectoryTabState();
}

class _DirectoryTabState extends State<DirectoryTab> {
  String _filter = 'All';

  static const _filters = ['All', 'Laboratories', 'Dental'];
  static const _trendingTests = ['Malaria + Typhoid', 'Fasting Blood Sugar'];

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
            Text('Directory', style: textTheme.headlineMedium),
            const SizedBox(height: AppSpacing.md),
            const TextField(
              decoration: InputDecoration(
                hintText: 'Find diagnostic labs & clinics near you',
                prefixIcon: Icon(Icons.search),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _filters.length,
                separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.sm),
                itemBuilder: (context, index) {
                  final label = _filters[index];
                  final selected = label == _filter;
                  return ChoiceChip(
                    label: Text(label),
                    selected: selected,
                    onSelected: (_) => setState(() => _filter = label),
                    selectedColor: AppColors.primary,
                    labelStyle: TextStyle(
                      color: selected ? Colors.white : AppColors.onSurfaceVariant,
                      fontWeight: FontWeight.w600,
                    ),
                    backgroundColor: AppColors.surfaceContainerLowest,
                    side: BorderSide(
                      color: selected ? AppColors.primary : AppColors.outlineVariant,
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            const _FeaturedLabCard(),
            const SizedBox(height: AppSpacing.xl),
            Text('Trending Tests', style: textTheme.headlineSmall),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final test in _trendingTests)
                  Chip(
                    avatar: const Icon(Icons.trending_up, size: 16, color: AppColors.primary),
                    label: Text(test),
                    backgroundColor: AppColors.surfaceContainerLowest,
                    side: const BorderSide(color: AppColors.outlineVariant),
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.xl),
            const _ClinicListTile(
              name: 'Lagos State Eye Clinic',
              meta: '2.0km • Ikeja Ave • Opens 8:00 AM',
            ),
          ],
        ),
      ),
    );
  }
}

class _FeaturedLabCard extends StatelessWidget {
  const _FeaturedLabCard();

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              Container(
                height: 120,
                width: double.infinity,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF0F172A), AppColors.primary],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: const Icon(Icons.biotech, color: Colors.white38, size: 48),
              ),
              Positioned(
                top: AppSpacing.sm,
                right: AppSpacing.sm,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.secondaryContainer,
                    borderRadius: BorderRadius.circular(AppRadii.full),
                  ),
                  child: Text(
                    'Open 24/7',
                    style: textTheme.labelSmall?.copyWith(
                      color: AppColors.onSecondaryContainer,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Care Diagnostics Lab', style: textTheme.headlineSmall),
                const SizedBox(height: 2),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 14, color: AppColors.outline),
                    Text(' 0.2km • Admin Avenue', style: textTheme.bodySmall),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: const [
                    Icon(Icons.star, size: 14, color: Color(0xFFF5B301)),
                    Icon(Icons.star, size: 14, color: Color(0xFFF5B301)),
                    Icon(Icons.star, size: 14, color: Color(0xFFF5B301)),
                    Icon(Icons.star, size: 14, color: Color(0xFFF5B301)),
                    Icon(Icons.star_half, size: 14, color: Color(0xFFF5B301)),
                    SizedBox(width: 4),
                    Text('(126 Reviews)', style: TextStyle(fontSize: 12, color: AppColors.outline)),
                  ],
                ),
                const Divider(height: AppSpacing.lg),
                const _TestRow(name: 'Full Blood Count', duration: 'Same-day', price: '₦7,500'),
                const _TestRow(name: 'Lipid Profile', duration: 'Fasting Required', price: '₦12,000'),
                const SizedBox(height: AppSpacing.md),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => context.push('/book-test'),
                    child: const Text('Book & Pay Now'),
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

class _TestRow extends StatelessWidget {
  const _TestRow({required this.name, required this.duration, required this.price});

  final String name;
  final String duration;
  final String price;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                Text(duration, style: textTheme.bodySmall),
              ],
            ),
          ),
          Text(price, style: textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          )),
        ],
      ),
    );
  }
}

class _ClinicListTile extends StatelessWidget {
  const _ClinicListTile({required this.name, required this.meta});

  final String name;
  final String meta;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerHigh,
                    borderRadius: BorderRadius.circular(AppRadii.md),
                  ),
                  child: const Icon(Icons.local_hospital_outlined, color: AppColors.primary),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name, style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                      Text(meta, style: textTheme.bodySmall),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(minimumSize: const Size(0, 36)),
                    child: const Text('Details'),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(minimumSize: const Size(0, 36)),
                    child: const Text('Book'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
