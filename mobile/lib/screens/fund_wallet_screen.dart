import 'dart:async';

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../providers/wallet_provider.dart';
import '../theme/app_theme.dart';
import 'checkout_webview_screen.dart';

enum _PaymentMethod { bankTransfer, debitCard }

class FundWalletScreen extends StatefulWidget {
  const FundWalletScreen({super.key});

  @override
  State<FundWalletScreen> createState() => _FundWalletScreenState();
}

class _FundWalletScreenState extends State<FundWalletScreen> {
  final _amountController = TextEditingController();
  _PaymentMethod _method = _PaymentMethod.debitCard;
  bool _submitting = false;

  static const _quickAmounts = ['₦5,000', '₦10,000', '₦20,000'];

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _proceed() async {
    if (_method == _PaymentMethod.bankTransfer) {
      // Bank transfer no longer goes through Nomba Checkout's pay-by-transfer
      // option (a short-lived dynamic account that stops being reconcilable
      // to an order once its window expires) - it shows the user's own
      // permanent dedicated account instead, any amount, any time.
      context.push('/bank-transfer-details');
      return;
    }

    final naira = double.tryParse(_amountController.text.replaceAll(',', ''));
    if (naira == null || naira <= 0) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Enter a valid amount.')));
      return;
    }

    setState(() => _submitting = true);
    final wallet = context.read<WalletProvider>();
    final order = await wallet.fund(
      (naira * 100).round(),
      method: _method == _PaymentMethod.bankTransfer ? 'bank_transfer' : 'card',
      platform: kIsWeb ? 'web' : 'mobile',
    );
    if (!mounted) return;
    setState(() => _submitting = false);

    if (order == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(wallet.errorMessage ?? 'Could not start payment'),
        ),
      );
      return;
    }
    final checkoutLink = order['checkoutLink']!;
    final orderReference = order['orderReference']!;

    if (kIsWeb) {
      // webview_flutter has no web support, and payment pages generally
      // refuse to render inside an embedded iframe anyway - open a real
      // browser tab instead. Nomba redirects that tab to a plain https
      // "payment received" page (see backend platform=web callback), and
      // wallet crediting itself happens via the Nomba webhook independent
      // of this tab, so there's nothing here to await a return from.
      await launchUrl(Uri.parse(checkoutLink), webOnlyWindowName: '_blank');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Complete your payment in the new tab, then return here.',
          ),
        ),
      );
    } else {
      await Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => CheckoutWebViewScreen(checkoutUrl: checkoutLink),
        ),
      );
    }
    if (!mounted) return;
    final walletProvider = context.read<WalletProvider>();
    // Check Nomba directly rather than just waiting on their webhook - this
    // is what actually credits the wallet promptly even if the webhook is
    // delayed, rejected, or never arrives (see backend reconcileFunding).
    final status = await walletProvider.verifyFunding(orderReference);
    if (status == 'pending') {
      // Nomba may not have finished processing yet - one delayed retry
      // covers that without building a full polling loop (a background
      // sweep on the backend catches anything still unresolved after this).
      unawaited(
        Future.delayed(const Duration(seconds: 5), () {
          if (mounted) walletProvider.verifyFunding(orderReference);
        }),
      );
    }
    if (mounted) context.pop();
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
                        _amountController.text = amount.replaceAll(
                          RegExp(r'[^0-9]'),
                          '',
                        );
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
                onTap: () =>
                    setState(() => _method = _PaymentMethod.bankTransfer),
              ),
              const SizedBox(height: AppSpacing.sm),
              _PaymentOption(
                icon: Icons.credit_card,
                title: 'Debit Card',
                subtitle: 'Pay with Nomba Checkout',
                selected: _method == _PaymentMethod.debitCard,
                onTap: () => setState(() => _method = _PaymentMethod.debitCard),
              ),
              const SizedBox(height: AppSpacing.xl),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _submitting ? null : _proceed,
                  child: _submitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              _method == _PaymentMethod.bankTransfer
                                  ? 'View Transfer Details'
                                  : 'Proceed to Payment',
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            const Icon(Icons.arrow_forward, size: 18),
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
      color: selected
          ? AppColors.secondaryContainer.withValues(alpha: 0.25)
          : null,
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
                    Text(
                      title,
                      style: textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(subtitle, style: textTheme.bodySmall),
                  ],
                ),
              ),
              Icon(
                selected
                    ? Icons.radio_button_checked
                    : Icons.radio_button_unchecked,
                color: selected ? AppColors.primary : AppColors.outline,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
