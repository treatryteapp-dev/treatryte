import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/wallet_provider.dart';
import '../theme/app_theme.dart';

// The whole "Fund Wallet" flow: shows the user's permanent dedicated Nomba
// account - transfers to it reflect automatically via webhook (see backend
// wallet.service.js getOrCreateVirtualAccount / vact_transfer webhook
// handling). Card checkout was removed - its "pay by transfer" option
// generated a short-lived dynamic account that stopped being reconcilable
// once its window expired, which is what caused funds to go unreflected.
class BankTransferDetailsScreen extends StatefulWidget {
  const BankTransferDetailsScreen({super.key});

  @override
  State<BankTransferDetailsScreen> createState() =>
      _BankTransferDetailsScreenState();
}

class _BankTransferDetailsScreenState
    extends State<BankTransferDetailsScreen> {
  ({String accountNumber, String bankName})? _account;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final account = await context.read<WalletProvider>().getVirtualAccount();
    if (!mounted) return;
    setState(() {
      _loading = false;
      _account = account;
      if (account == null) {
        _error =
            context.read<WalletProvider>().errorMessage ??
            'Could not load your transfer account.';
      }
    });
  }

  void _copyAccountNumber() {
    final account = _account;
    if (account == null) return;
    Clipboard.setData(ClipboardData(text: account.accountNumber));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Account number copied.')),
    );
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
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(_error!, textAlign: TextAlign.center),
                      const SizedBox(height: AppSpacing.md),
                      OutlinedButton(
                        onPressed: _load,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              )
            : Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'This is your permanent TreatRyte funding account.',
                      style: textTheme.bodyMedium,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      'Transfer any amount from your bank app at any time - your '
                      'wallet updates automatically, usually within a few minutes.',
                      style: textTheme.bodySmall?.copyWith(
                        color: AppColors.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    Container(
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
                          Text('ACCOUNT NUMBER', style: textTheme.labelSmall),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  _account!.accountNumber,
                                  style: textTheme.headlineMedium,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(
                                  Icons.copy_outlined,
                                  color: AppColors.primary,
                                ),
                                onPressed: _copyAccountNumber,
                              ),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.md),
                          Text('BANK NAME', style: textTheme.labelSmall),
                          const SizedBox(height: 4),
                          Text(
                            _account!.bankName,
                            style: textTheme.bodyLarge?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    Row(
                      children: [
                        const Icon(
                          Icons.shield_outlined,
                          size: 16,
                          color: AppColors.secondary,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Expanded(
                          child: Text(
                            'This account is unique to you - only transfer from an '
                            'account you own.',
                            style: textTheme.bodySmall,
                          ),
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
