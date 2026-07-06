import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/provider_models.dart';
import '../../providers/partner_provider.dart';
import '../../theme/app_theme.dart';

class PartnerServicesTab extends StatefulWidget {
  const PartnerServicesTab({super.key});

  @override
  State<PartnerServicesTab> createState() => _PartnerServicesTabState();
}

class _PartnerServicesTabState extends State<PartnerServicesTab> {
  bool _loaded = false;
  String _query = '';

  @override
  Widget build(BuildContext context) {
    if (!_loaded) {
      _loaded = true;
      final provider = context.read<PartnerProvider>();
      Future.microtask(() => provider.loadServices());
    }

    final textTheme = Theme.of(context).textTheme;
    final partner = context.watch<PartnerProvider>();
    final filtered = partner.services
        .where((s) => s.name.toLowerCase().contains(_query.toLowerCase()))
        .toList();
    final averagePriceKobo = partner.services.isEmpty
        ? 0
        : partner.services.map((s) => s.priceKobo).reduce((a, b) => a + b) ~/
              partner.services.length;

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => context.read<PartnerProvider>().loadServices(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Service & Pricing', style: textTheme.headlineSmall),
              const SizedBox(height: 2),
              Text(
                'Manage your diagnostic and clinical services. Update pricing and availability in real-time.',
                style: textTheme.bodySmall,
              ),
              const SizedBox(height: AppSpacing.lg),

              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.secondary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadii.lg),
                  border: Border.all(
                    color: AppColors.secondary.withValues(alpha: 0.2),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.trending_up, color: AppColors.secondary),
                    const SizedBox(width: AppSpacing.md),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Average Service Price',
                          style: TextStyle(
                            color: AppColors.onSecondaryContainer,
                            fontSize: 12,
                          ),
                        ),
                        Text(
                          '₦${(averagePriceKobo / 100).toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.onSecondaryContainer,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              Row(
                children: [
                  Expanded(
                    child: TextField(
                      onChanged: (value) => setState(() => _query = value),
                      decoration: const InputDecoration(
                        hintText: 'Search services...',
                        prefixIcon: Icon(
                          Icons.search,
                          color: AppColors.outline,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  IconButton.filled(
                    onPressed: () => _showServiceForm(context),
                    icon: const Icon(Icons.add),
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadii.lg),
                      ),
                      minimumSize: const Size(56, 56),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              if (partner.isLoading && partner.services.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(AppSpacing.xl),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (filtered.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.xl),
                  child: Text(
                    'No services yet. Tap + to add your first one.',
                    style: textTheme.bodySmall,
                  ),
                )
              else
                for (final service in filtered) ...[
                  _buildServiceItem(context, service),
                  const Divider(),
                ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildServiceItem(BuildContext context, PartnerService service) {
    final textTheme = Theme.of(context).textTheme;
    return InkWell(
      onTap: () => _showServiceForm(context, existing: service),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    service.name,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(service.category, style: textTheme.bodySmall),
                ],
              ),
            ),
            Row(
              children: [
                Text(
                  '₦${(service.priceKobo / 100).toStringAsFixed(0)}',
                  style: textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                const Icon(Icons.chevron_right, color: AppColors.outline),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showServiceForm(
    BuildContext context, {
    PartnerService? existing,
  }) async {
    final nameController = TextEditingController(text: existing?.name ?? '');
    final categoryController = TextEditingController(
      text: existing?.category ?? '',
    );
    final priceController = TextEditingController(
      text: existing != null
          ? (existing.priceKobo / 100).toStringAsFixed(0)
          : '',
    );
    final formKey = GlobalKey<FormState>();

    final partner = context.read<PartnerProvider>();

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) {
        return Padding(
          padding: EdgeInsets.only(
            left: AppSpacing.lg,
            right: AppSpacing.lg,
            top: AppSpacing.lg,
            bottom:
                MediaQuery.of(sheetContext).viewInsets.bottom + AppSpacing.lg,
          ),
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  existing == null ? 'Add Service' : 'Edit Service',
                  style: Theme.of(sheetContext).textTheme.headlineSmall,
                ),
                const SizedBox(height: AppSpacing.lg),
                TextFormField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Service Name'),
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? 'Required' : null,
                ),
                const SizedBox(height: AppSpacing.md),
                TextFormField(
                  controller: categoryController,
                  decoration: const InputDecoration(labelText: 'Category'),
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? 'Required' : null,
                ),
                const SizedBox(height: AppSpacing.md),
                TextFormField(
                  controller: priceController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Price (₦)'),
                  validator: (v) {
                    final parsed = int.tryParse(v ?? '');
                    return (parsed == null || parsed <= 0)
                        ? 'Enter a valid amount'
                        : null;
                  },
                ),
                const SizedBox(height: AppSpacing.lg),
                Row(
                  children: [
                    if (existing != null)
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () async {
                            await partner.deleteService(existing.id);
                            if (sheetContext.mounted)
                              Navigator.of(sheetContext).pop();
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.error,
                          ),
                          child: const Text('Delete'),
                        ),
                      ),
                    if (existing != null) const SizedBox(width: AppSpacing.md),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        onPressed: () async {
                          if (!(formKey.currentState?.validate() ?? false))
                            return;
                          final priceKobo =
                              int.parse(priceController.text.trim()) * 100;
                          final ok = existing == null
                              ? await partner.createService(
                                  name: nameController.text.trim(),
                                  priceKobo: priceKobo,
                                  category: categoryController.text.trim(),
                                )
                              : await partner.updateService(
                                  existing.id,
                                  name: nameController.text.trim(),
                                  priceKobo: priceKobo,
                                  category: categoryController.text.trim(),
                                );
                          if (sheetContext.mounted && ok)
                            Navigator.of(sheetContext).pop();
                        },
                        child: Text(
                          existing == null ? 'Add Service' : 'Save Changes',
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
