import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../models/directory_models.dart';
import '../theme/app_theme.dart';
import 'book_test_screen.dart';

/// Full service list for one partner, with multi-select so a patient can
/// book several services (e.g. 5 tests) as a single appointment instead of
/// repeating the booking flow per service. Scales to however many services
/// a partner lists - unlike the Directory card's 3-item preview.
class LabDetailScreen extends StatefulWidget {
  const LabDetailScreen({super.key, required this.lab});

  final Lab lab;

  @override
  State<LabDetailScreen> createState() => _LabDetailScreenState();
}

class _LabDetailScreenState extends State<LabDetailScreen> {
  final Set<String> _selectedIds = {};

  String _formatNaira(int kobo) =>
      '₦${(kobo / 100).toStringAsFixed(kobo % 100 == 0 ? 0 : 2)}';

  int get _totalKobo => widget.lab.tests
      .where((t) => _selectedIds.contains(t.id))
      .fold(0, (sum, t) => sum + (t.priceKobo ?? 0));

  void _continue() {
    final selected = widget.lab.tests
        .where((t) => _selectedIds.contains(t.id))
        .toList();
    context.push(
      '/book-test',
      extra: BookTestArgs(
        labId: widget.lab.id,
        labName: widget.lab.name,
        labAddress: widget.lab.address,
        services: [
          for (final test in selected)
            SelectedService(
              id: test.id,
              name: test.name,
              priceKobo: test.priceKobo ?? 0,
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final lab = widget.lab;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text(lab.name),
      ),
      body: SafeArea(
        child: lab.tests.isEmpty
            ? Center(
                child: Text(
                  'No services listed yet.',
                  style: textTheme.bodyMedium,
                ),
              )
            : ListView.separated(
                padding: const EdgeInsets.all(AppSpacing.lg),
                itemCount: lab.tests.length,
                separatorBuilder: (_, _) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final test = lab.tests[index];
                  final selected = _selectedIds.contains(test.id);
                  return CheckboxListTile(
                    value: selected,
                    onChanged: (value) => setState(() {
                      if (value == true) {
                        _selectedIds.add(test.id);
                      } else {
                        _selectedIds.remove(test.id);
                      }
                    }),
                    controlAffinity: ListTileControlAffinity.leading,
                    contentPadding: EdgeInsets.zero,
                    title: Text(
                      test.name,
                      style: textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: test.duration != null
                        ? Text(test.duration!)
                        : null,
                    secondary: Text(
                      test.priceKobo != null
                          ? _formatNaira(test.priceKobo!)
                          : '',
                      style: textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                  );
                },
              ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  _selectedIds.isEmpty
                      ? 'Select one or more services'
                      : '${_selectedIds.length} selected • ${_formatNaira(_totalKobo)}',
                  style: textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Material(
                // Flutter web quirk on this build: ElevatedButton silently
                // fails to render anywhere inside Scaffold.bottomNavigationBar
                // (confirmed via isolated debug routes), regardless of
                // enabled state or ancestor Material wrapping - this hand-
                // built equivalent renders correctly in the same position.
                color: _selectedIds.isEmpty
                    ? AppColors.surfaceContainerHigh
                    : AppColors.primary,
                borderRadius: BorderRadius.circular(AppRadii.lg),
                child: InkWell(
                  borderRadius: BorderRadius.circular(AppRadii.lg),
                  onTap: _selectedIds.isEmpty ? null : _continue,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.lg,
                      vertical: 14,
                    ),
                    child: Text(
                      'Continue',
                      style: textTheme.labelLarge?.copyWith(
                        color: _selectedIds.isEmpty
                            ? AppColors.onSurfaceVariant
                            : AppColors.onPrimary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
