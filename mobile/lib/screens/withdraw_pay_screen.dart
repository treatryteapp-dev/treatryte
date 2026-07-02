import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/bank.dart';
import '../providers/wallet_provider.dart';
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
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<WalletProvider>().refresh();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final wallet = context.watch<WalletProvider>();

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
                      wallet.formattedBalance,
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

class _WithdrawToBankForm extends StatefulWidget {
  const _WithdrawToBankForm();

  @override
  State<_WithdrawToBankForm> createState() => _WithdrawToBankFormState();
}

class _WithdrawToBankFormState extends State<_WithdrawToBankForm> {
  final _accountNumberController = TextEditingController();
  final _amountController = TextEditingController();
  List<Bank> _banks = [];
  Bank? _selectedBank;
  String? _resolvedAccountName;
  bool _resolving = false;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final banks = await context.read<WalletProvider>().getBanks();
      if (mounted) setState(() => _banks = banks);
    });
    _accountNumberController.addListener(_maybeLookupAccount);
  }

  @override
  void dispose() {
    _accountNumberController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _maybeLookupAccount() async {
    if (_accountNumberController.text.length != 10 || _selectedBank == null) return;
    setState(() {
      _resolving = true;
      _resolvedAccountName = null;
    });
    final name = await context.read<WalletProvider>().lookupAccount(
          accountNumber: _accountNumberController.text,
          bankCode: _selectedBank!.code,
        );
    if (mounted) {
      setState(() {
        _resolving = false;
        _resolvedAccountName = name;
      });
    }
  }

  Future<void> _submit() async {
    final naira = double.tryParse(_amountController.text);
    if (_selectedBank == null || _resolvedAccountName == null || naira == null || naira <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Complete all fields with a valid account and amount.')),
      );
      return;
    }

    setState(() => _submitting = true);
    final wallet = context.read<WalletProvider>();
    final success = await wallet.withdraw(
      amountKobo: (naira * 100).round(),
      accountNumber: _accountNumberController.text,
      bankCode: _selectedBank!.code,
      accountName: _resolvedAccountName!,
    );
    if (!mounted) return;
    setState(() => _submitting = false);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(success ? 'Withdrawal submitted.' : (wallet.errorMessage ?? 'Withdrawal failed'))),
    );
    if (success) context.pop();
  }

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
          DropdownButtonFormField<Bank>(
            initialValue: _selectedBank,
            hint: const Text('Select a bank'),
            items: [
              for (final bank in _banks) DropdownMenuItem(value: bank, child: Text(bank.name)),
            ],
            onChanged: (bank) {
              setState(() {
                _selectedBank = bank;
                _resolvedAccountName = null;
              });
              _maybeLookupAccount();
            },
          ),
          const SizedBox(height: AppSpacing.md),
          Text('Account Number', style: textTheme.labelSmall),
          const SizedBox(height: AppSpacing.sm),
          TextField(
            controller: _accountNumberController,
            keyboardType: TextInputType.number,
            maxLength: 10,
            decoration: InputDecoration(
              hintText: 'Enter 10-digit number',
              suffixIcon: _resolving
                  ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                    )
                  : null,
            ),
          ),
          if (_resolvedAccountName != null)
            Text(
              _resolvedAccountName!,
              style: textTheme.bodyMedium?.copyWith(color: AppColors.primary, fontWeight: FontWeight.w600),
            ),
          const SizedBox(height: AppSpacing.md),
          Text('Amount to Withdraw (₦)', style: textTheme.labelSmall),
          const SizedBox(height: AppSpacing.sm),
          TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(hintText: '0.00'),
          ),
          const SizedBox(height: AppSpacing.xl),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _submitting ? null : _submit,
              child: _submitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Withdraw Funds'),
            ),
          ),
        ],
      ),
    );
  }
}

class _PayForServiceForm extends StatefulWidget {
  const _PayForServiceForm();

  @override
  State<_PayForServiceForm> createState() => _PayForServiceFormState();
}

class _PayForServiceFormState extends State<_PayForServiceForm> {
  final _codeController = TextEditingController();
  final _amountController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _codeController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final naira = double.tryParse(_amountController.text);
    if (_codeController.text.trim().isEmpty || naira == null || naira <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a provider code and a valid amount.')),
      );
      return;
    }

    setState(() => _submitting = true);
    final wallet = context.read<WalletProvider>();
    final success = await wallet.payProvider(
      amountKobo: (naira * 100).round(),
      providerCode: _codeController.text.trim(),
    );
    if (!mounted) return;
    setState(() => _submitting = false);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(success ? 'Payment sent.' : (wallet.errorMessage ?? 'Payment failed'))),
    );
    if (success) context.pop();
  }

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
          TextField(
            controller: _codeController,
            decoration: const InputDecoration(hintText: 'e.g. TR-LAB-2049'),
          ),
          const SizedBox(height: AppSpacing.md),
          Text('Amount to Pay (₦)', style: textTheme.labelSmall),
          const SizedBox(height: AppSpacing.sm),
          TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(hintText: '0.00'),
          ),
          const SizedBox(height: AppSpacing.xl),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _submitting ? null : _submit,
              child: _submitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Pay Provider'),
            ),
          ),
        ],
      ),
    );
  }
}
