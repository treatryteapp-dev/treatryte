import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_theme.dart';

enum _PaymentMethod { bankTransfer, debitCard, ussd }

class FundWalletScreen extends StatefulWidget {
  const FundWalletScreen({super.key});

  @override
  State<FundWalletScreen> createState() => _FundWalletScreenState();
}

class _FundWalletScreenState extends State<FundWalletScreen> {
  final _amountController = TextEditingController();
  _PaymentMethod _method = _PaymentMethod.debitCard;

  static const _quickAmounts = ['₦5,000', '₦10,000', '₦20,000'];

  @override
  void dispose() {
    _amountController.dispose();
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
        title: const Text('Fund Wallet'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('ENTER AMOUNT (NGN)', style: textTheme.labelSmall),
              const SizedBox(height: AppSpacing.sm),
              TextField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                style: textTheme.headlineMedium,
                decoration: const InputDecoration(
                  prefixText: '₦ ',
                  hintText: '0.00',
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Wrap(
                spacing: AppSpacing.sm,
                children: [
                  for (final amount in _quickAmounts)
                    OutlinedButton(
                      onPressed: () {
                        _amountController.text =
                            amount.replaceAll(RegExp(r'[^0-9]'), '');
                      },
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(0, 36),
                        side: const BorderSide(color: AppColors.outlineVariant),
                        foregroundColor: AppColors.onSurface,
                      ),
                      child: Text(amount),
                    ),
                ],
              ),
              const SizedBox(height: AppSpacing.xl),
              Text('Select Payment Method', style: textTheme.headlineSmall),
              const SizedBox(height: AppSpacing.md),
              _PaymentOption(
                icon: Icons.account_balance_outlined,
                title: 'Bank Transfer',
                subtitle: 'Manual transfer to account',
                selected: _method == _PaymentMethod.bankTransfer,
                onTap: () => setState(() => _method = _PaymentMethod.bankTransfer),
              ),
              const SizedBox(height: AppSpacing.sm),
              _PaymentOption(
                icon: Icons.credit_card,
                title: 'Debit Card',
                subtitle: 'Paystack / Flutterwave',
                selected: _method == _PaymentMethod.debitCard,
                onTap: () => setState(() => _method = _PaymentMethod.debitCard),
              ),
              const SizedBox(height: AppSpacing.sm),
              _PaymentOption(
                icon: Icons.dialpad,
                title: 'USSD',
                subtitle: 'Pay using bank USSD code',
                selected: _method == _PaymentMethod.ussd,
                onTap: () => setState(() => _method = _PaymentMethod.ussd),
              ),
              const SizedBox(height: AppSpacing.xl),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.pop(),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Proceed to Payment'),
                      SizedBox(width: AppSpacing.sm),
                      Icon(Icons.arrow_forward, size: 18),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              const Center(
                child: Text(
                  'PCI-DSS COMPLIANT',
                  style: TextStyle(fontSize: 11, color: AppColors.outline),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PaymentOption extends StatelessWidget {
  const _PaymentOption({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Card(
      color: selected ? AppColors.secondaryContainer.withValues(alpha: 0.25) : null,
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
          child: Row(
            children: [
              Icon(icon, color: AppColors.primary),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                    Text(subtitle, style: textTheme.bodySmall),
                  ],
                ),
              ),
              Icon(
                selected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                color: selected ? AppColors.primary : AppColors.outline,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
