import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../models/directory_models.dart';
import '../../providers/directory_provider.dart';
import '../../theme/app_theme.dart';
import '../book_test_screen.dart';

class DirectoryTab extends StatefulWidget {
  const DirectoryTab({super.key});

  @override
  State<DirectoryTab> createState() => _DirectoryTabState();
}

class _DirectoryTabState extends State<DirectoryTab> {
  String _filter = 'All';

  static const _filters = ['All', 'Laboratories', 'Dental'];
  static const _filterToType = {'All': 'all', 'Laboratories': 'laboratory', 'Dental': 'dental'};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DirectoryProvider>().refresh();
    });
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final directory = context.watch<DirectoryProvider>();

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => context.read<DirectoryProvider>().refresh(clinicType: _filterToType[_filter]),
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
                      onSelected: (_) {
                        setState(() => _filter = label);
                        context.read<DirectoryProvider>().filterClinics(_filterToType[label]!);
                      },
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
              if (directory.isLoading && directory.labs.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: AppSpacing.lg),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (directory.labs.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
                  child: Text('No approved diagnostic centres yet.', style: textTheme.bodySmall),
                )
              else
                for (final lab in directory.labs) _FeaturedLabCard(lab: lab),
              const SizedBox(height: AppSpacing.xl),
              Text('Trending Tests', style: textTheme.headlineSmall),
              const SizedBox(height: AppSpacing.sm),
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: [
                  for (final test in directory.trendingTests)
                    Chip(
                      avatar: const Icon(Icons.trending_up, size: 16, color: AppColors.primary),
                      label: Text(test.name),
                      backgroundColor: AppColors.surfaceContainerLowest,
                      side: const BorderSide(color: AppColors.outlineVariant),
                    ),
                ],
              ),
              const SizedBox(height: AppSpacing.xl),
              for (final clinic in directory.clinics)
                _ClinicListTile(
                  name: clinic.name,
                  meta: '${clinic.distanceKm}km • ${clinic.address} • ${clinic.hours}',
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FeaturedLabCard extends StatelessWidget {
  const _FeaturedLabCard({required this.lab});

  final Lab lab;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final fullStars = lab.rating.floor();
    final hasHalfStar = lab.rating - fullStars >= 0.5;

    return Card(
      clipBehavior: Clip.antiAlias,
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
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
                    lab.hours,
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
                Text(lab.name, style: textTheme.headlineSmall),
                const SizedBox(height: 2),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 14, color: AppColors.outline),
                    Text(' ${lab.distanceKm}km • ${lab.address}', style: textTheme.bodySmall),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    for (var i = 0; i < 5; i++)
                      Icon(
                        i < fullStars
                            ? Icons.star
                            : (i == fullStars && hasHalfStar ? Icons.star_half : Icons.star_border),
                        size: 14,
                        color: const Color(0xFFF5B301),
                      ),
                    const SizedBox(width: 4),
                    Text('(${lab.reviewCount} Reviews)',
                        style: const TextStyle(fontSize: 12, color: AppColors.outline)),
                  ],
                ),
                const Divider(height: AppSpacing.lg),
                for (final test in lab.tests)
                  _TestRow(
                    name: test.name,
                    duration: test.duration ?? '',
                    price: test.priceKobo != null ? '₦${(test.priceKobo! / 100).toStringAsFixed(0)}' : '',
                  ),
                const SizedBox(height: AppSpacing.md),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: lab.tests.isEmpty
                        ? null
                        : () => context.push(
                              '/book-test',
                              extra: BookTestArgs(
                                labId: lab.id,
                                labName: lab.name,
                                labAddress: lab.address,
                                testId: lab.tests.first.id,
                                testName: lab.tests.first.name,
                                priceKobo: lab.tests.first.priceKobo ?? 0,
                              ),
                            ),
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
