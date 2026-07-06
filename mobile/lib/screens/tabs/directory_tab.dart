import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../models/directory_models.dart';
import '../../providers/directory_provider.dart';
import '../../theme/app_theme.dart';
import '../../utils/nigerian_states.dart';
import '../book_test_screen.dart';

class DirectoryTab extends StatefulWidget {
  const DirectoryTab({super.key});

  @override
  State<DirectoryTab> createState() => _DirectoryTabState();
}

class _DirectoryTabState extends State<DirectoryTab> {
  String _filter = 'All';
  String _state = 'All States';
  final _searchController = TextEditingController();
  Timer? _debounce;

  // Mirrors the real "Services Offered" categories partners pick from at
  // registration - this is what actually gets stored per-lab, so filtering
  // on it returns real, matching results instead of guessed ones.
  static const _filters = [
    'All',
    'General Practice',
    'Diagnostics',
    'Maternity Care',
    'Pharmacy',
    'Surgical Center',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DirectoryProvider>().refresh(type: _filter == 'All' ? 'all' : _filter);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      context.read<DirectoryProvider>().refresh(query: query);
    });
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final directory = context.watch<DirectoryProvider>();

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => context.read<DirectoryProvider>().refresh(
              type: _filter == 'All' ? 'all' : _filter,
              query: _searchController.text,
              state: _state == 'All States' ? 'all' : _state,
            ),
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
              TextField(
                controller: _searchController,
                onChanged: _onSearchChanged,
                decoration: const InputDecoration(
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
                        context.read<DirectoryProvider>().refresh(
                              type: label == 'All' ? 'all' : label,
                              query: _searchController.text,
                              state: _state == 'All States' ? 'all' : _state,
                            );
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
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, size: 18, color: AppColors.outline),
                  const SizedBox(width: AppSpacing.xs),
                  Expanded(
                    child: DropdownButtonHideUnderline(
                      child: DropdownButtonFormField<String>(
                        initialValue: _state,
                        isDense: true,
                        decoration: const InputDecoration(
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 4),
                        ),
                        items: ['All States', ...kNigerianStates]
                            .map((state) => DropdownMenuItem(value: state, child: Text(state)))
                            .toList(),
                        onChanged: (value) {
                          if (value == null) return;
                          setState(() => _state = value);
                          context.read<DirectoryProvider>().refresh(
                                type: _filter == 'All' ? 'all' : _filter,
                                query: _searchController.text,
                                state: value == 'All States' ? 'all' : value,
                              );
                        },
                      ),
                    ),
                  ),
                ],
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
            ],
          ),
        ),
      ),
    );
  }
}

class _FeaturedLabCard extends StatefulWidget {
  const _FeaturedLabCard({required this.lab});

  final Lab lab;

  @override
  State<_FeaturedLabCard> createState() => _FeaturedLabCardState();
}

class _FeaturedLabCardState extends State<_FeaturedLabCard> {
  static const _collapsedCount = 3;
  bool _expanded = false;

  void _bookTest(BuildContext context, LabTest test) {
    final lab = widget.lab;
    context.push(
      '/book-test',
      extra: BookTestArgs(
        labId: lab.id,
        labName: lab.name,
        labAddress: lab.address,
        testId: test.id,
        testName: test.name,
        priceKobo: test.priceKobo ?? 0,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lab = widget.lab;
    final textTheme = Theme.of(context).textTheme;
    final fullStars = lab.rating.floor();
    final hasHalfStar = lab.rating - fullStars >= 0.5;
    final hasMoreTests = lab.tests.length > _collapsedCount;
    final visibleTests = _expanded ? lab.tests : lab.tests.take(_collapsedCount).toList();

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
                if (lab.tests.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                    child: Text('No services listed yet.', style: textTheme.bodySmall),
                  )
                else
                  for (final test in visibleTests)
                    _TestRow(
                      name: test.name,
                      duration: test.duration ?? '',
                      price: test.priceKobo != null ? '₦${(test.priceKobo! / 100).toStringAsFixed(0)}' : '',
                      onBook: () => _bookTest(context, test),
                    ),
                if (hasMoreTests)
                  Padding(
                    padding: const EdgeInsets.only(top: AppSpacing.xs),
                    child: TextButton(
                      onPressed: () => setState(() => _expanded = !_expanded),
                      style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(0, 32)),
                      child: Text(
                        _expanded ? 'Show less' : 'View all ${lab.tests.length} services',
                      ),
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
  const _TestRow({
    required this.name,
    required this.duration,
    required this.price,
    required this.onBook,
  });

  final String name;
  final String duration;
  final String price;
  final VoidCallback onBook;

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
          const SizedBox(width: AppSpacing.sm),
          OutlinedButton(
            onPressed: onBook,
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(0, 32),
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
              visualDensity: VisualDensity.compact,
            ),
            child: const Text('Book', style: TextStyle(fontSize: 12)),
          ),
        ],
      ),
    );
  }
}
