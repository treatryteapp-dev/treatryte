import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/bank.dart';
import '../providers/wallet_provider.dart';
import '../theme/app_theme.dart';

// Sending to your own account or paying a provider both end the same way -
// money leaving the wallet to an external bank account - so this is one
// plain bank-transfer form rather than two separate flows.
class WithdrawPayScreen extends StatefulWidget {
  const WithdrawPayScreen({super.key});

  @override
  State<WithdrawPayScreen> createState() => _WithdrawPayScreenState();
}

class _WithdrawPayScreenState extends State<WithdrawPayScreen> {
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
      context.read<WalletProvider>().refresh();
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

  Future<void> _pickBank() async {
    final bank = await showModalBottomSheet<Bank>(
      context: context,
      isScrollControlled: true,
      builder: (context) => _BankSearchSheet(banks: _banks),
    );
    if (bank == null) return;
    setState(() {
      _selectedBank = bank;
      _resolvedAccountName = null;
    });
    _maybeLookupAccount();
  }

  Future<void> _maybeLookupAccount() async {
    if (_accountNumberController.text.length != 10 || _selectedBank == null)
      return;
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
    if (_selectedBank == null ||
        _resolvedAccountName == null ||
        naira == null ||
        naira <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Complete all fields with a valid account and amount.'),
        ),
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
      SnackBar(
        content: Text(
          success ? 'Money sent.' : (wallet.errorMessage ?? 'Transfer failed'),
        ),
      ),
    );
    if (success) context.pop();
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
        title: const Text('Send Money'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
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
                    Text(
                      'TreatRyte Wallet Balance',
                      style: textTheme.bodySmall,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      wallet.formattedBalance,
                      style: textTheme.headlineMedium?.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      children: [
                        const Icon(
                          Icons.shield,
                          size: 16,
                          color: AppColors.secondary,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Text(
                          'Transactions secured by Nomba MFB',
                          style: textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              Text('Select Destination Bank', style: textTheme.labelSmall),
              const SizedBox(height: AppSpacing.sm),
              InkWell(
                onTap: _banks.isEmpty ? null : _pickBank,
                borderRadius: BorderRadius.circular(AppRadii.md),
                child: InputDecorator(
                  decoration: const InputDecoration(),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          _selectedBank?.name ?? 'Select a bank',
                          style: _selectedBank == null
                              ? textTheme.bodyMedium?.copyWith(
                                  color: AppColors.outline,
                                )
                              : textTheme.bodyMedium,
                        ),
                      ),
                      const Icon(
                        Icons.arrow_drop_down,
                        color: AppColors.outline,
                      ),
                    ],
                  ),
                ),
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
                          child: SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        )
                      : null,
                ),
              ),
              if (_resolvedAccountName != null)
                Text(
                  _resolvedAccountName!,
                  style: textTheme.bodyMedium?.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              const SizedBox(height: AppSpacing.md),
              Text('Amount to Send (₦)', style: textTheme.labelSmall),
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
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Send Money'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BankSearchSheet extends StatefulWidget {
  const _BankSearchSheet({required this.banks});

  final List<Bank> banks;

  @override
  State<_BankSearchSheet> createState() => _BankSearchSheetState();
}

class _BankSearchSheetState extends State<_BankSearchSheet> {
  final _searchController = TextEditingController();
  late List<Bank> _filtered = widget.banks;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_filter);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _filter() {
    final query = _searchController.text.trim().toLowerCase();
    setState(() {
      _filtered = query.isEmpty
          ? widget.banks
          : widget.banks
                .where((b) => b.name.toLowerCase().contains(query))
                .toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.8,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: TextField(
                controller: _searchController,
                autofocus: true,
                decoration: const InputDecoration(
                  hintText: 'Search banks',
                  prefixIcon: Icon(Icons.search),
                ),
              ),
            ),
            Expanded(
              child: _filtered.isEmpty
                  ? const Center(child: Text('No banks match your search.'))
                  : ListView.builder(
                      controller: scrollController,
                      itemCount: _filtered.length,
                      itemBuilder: (context, index) {
                        final bank = _filtered[index];
                        return ListTile(
                          title: Text(bank.name),
                          onTap: () => Navigator.of(context).pop(bank),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
