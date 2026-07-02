import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_theme.dart';

class WithdrawPayScreen extends StatefulWidget {
  const WithdrawPayScreen({super.key});

  @override
  State<WithdrawPayScreen> createState() => _WithdrawPayScreenState();
}

class _WithdrawPayScreenState extends State<WithdrawPayScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Withdraw & Pay'),
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerLowest,
                  borderRadius: BorderRadius.circular(AppRadii.lg),
                  border: Border.all(color: AppColors.outlineVariant),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('TreatRyte Wallet Balance', style: textTheme.bodySmall),
                    const SizedBox(height: 4),
                    Text(
                      '₦45,000.00',
                      style: textTheme.headlineMedium?.copyWith(color: AppColors.primary),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      children: [
                        const Icon(Icons.shield, size: 16, color: AppColors.secondary),
                        const SizedBox(width: AppSpacing.xs),
                        Text('Funds secured by MedFin Insurance', style: textTheme.bodySmall),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            TabBar(
              controller: _tabController,
              labelColor: AppColors.primary,
              unselectedLabelColor: AppColors.outline,
              indicatorColor: AppColors.primary,
              tabs: const [
                Tab(text: 'Withdraw to Bank'),
                Tab(text: 'Pay for Service'),
              ],
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: const [
                  _WithdrawToBankForm(),
                  _PayForServiceForm(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _WithdrawToBankForm extends StatelessWidget {
  const _WithdrawToBankForm();

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Select Destination Bank', style: textTheme.labelSmall),
          const SizedBox(height: AppSpacing.sm),
          DropdownButtonFormField<String>(
            initialValue: 'zenith',
            items: const [
              DropdownMenuItem(value: 'zenith', child: Text('Zenith Bank')),
              DropdownMenuItem(value: 'gtb', child: Text('GTBank')),
              DropdownMenuItem(value: 'access', child: Text('Access Bank')),
            ],
            onChanged: (_) {},
          ),
          const SizedBox(height: AppSpacing.md),
          Text('Account Number', style: textTheme.labelSmall),
          const SizedBox(height: AppSpacing.sm),
          const TextField(
            keyboardType: TextInputType.number,
            decoration: InputDecoration(hintText: 'Enter 10-digit number'),
          ),
          const SizedBox(height: AppSpacing.md),
          Text('Amount to Withdraw (₦)', style: textTheme.labelSmall),
          const SizedBox(height: AppSpacing.sm),
          const TextField(
            keyboardType: TextInputType.number,
            decoration: InputDecoration(hintText: '0.00'),
          ),
          const SizedBox(height: AppSpacing.xl),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => context.pop(),
              child: const Text('Withdraw Funds'),
            ),
          ),
        ],
      ),
    );
  }
}

class _PayForServiceForm extends StatelessWidget {
  const _PayForServiceForm();

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Provider Payment Code', style: textTheme.labelSmall),
          const SizedBox(height: AppSpacing.sm),
          const TextField(
            decoration: InputDecoration(hintText: 'e.g. TR-LAB-2049'),
          ),
          const SizedBox(height: AppSpacing.md),
          Text('Amount to Pay (₦)', style: textTheme.labelSmall),
          const SizedBox(height: AppSpacing.sm),
          const TextField(
            keyboardType: TextInputType.number,
            decoration: InputDecoration(hintText: '0.00'),
          ),
          const SizedBox(height: AppSpacing.xl),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => context.pop(),
              child: const Text('Pay Provider'),
            ),
          ),
        ],
      ),
    );
  }
}
