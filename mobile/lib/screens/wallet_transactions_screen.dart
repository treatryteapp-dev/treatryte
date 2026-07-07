import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/transaction.dart';
import '../providers/wallet_provider.dart';
import '../theme/app_theme.dart';

const _categories = {
  null: 'All',
  'wallet_funding': 'Funding',
  'withdrawal': 'Withdrawals',
  'service_payment': 'Payments',
  'refund': 'Refunds',
};

class WalletTransactionsScreen extends StatefulWidget {
  const WalletTransactionsScreen({super.key});

  @override
  State<WalletTransactionsScreen> createState() =>
      _WalletTransactionsScreenState();
}

class _WalletTransactionsScreenState extends State<WalletTransactionsScreen> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<WalletProvider>().loadHistory();
    });
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >
          _scrollController.position.maxScrollExtent - 200) {
        context.read<WalletProvider>().loadMoreHistory();
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final wallet = context.watch<WalletProvider>();
    final isEmpty = wallet.history.isEmpty;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Transaction History'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            SizedBox(
              height: 44,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg,
                  vertical: AppSpacing.xs,
                ),
                children: [
                  for (final entry in _categories.entries)
                    Padding(
                      padding: const EdgeInsets.only(right: AppSpacing.sm),
                      child: ChoiceChip(
                        label: Text(entry.value),
                        selected: wallet.historyCategory == entry.key,
                        onSelected: (_) =>
                            context.read<WalletProvider>().loadHistory(
                              category: entry.key,
                            ),
                      ),
                    ),
                ],
              ),
            ),
            Expanded(
              child: wallet.isLoadingHistory && isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : isEmpty
                  ? Center(
                      child: Text(
                        'No transactions yet.',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: () => context.read<WalletProvider>().loadHistory(
                        category: wallet.historyCategory,
                      ),
                      child: ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        itemCount:
                            wallet.history.length +
                            (wallet.hasMoreHistory ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (index >= wallet.history.length) {
                            return const Padding(
                              padding: EdgeInsets.symmetric(
                                vertical: AppSpacing.lg,
                              ),
                              child: Center(child: CircularProgressIndicator()),
                            );
                          }
                          return _TransactionTile(tx: wallet.history[index]);
                        },
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TransactionTile extends StatelessWidget {
  const _TransactionTile({required this.tx});

  final WalletTransaction tx;

  ({IconData icon, Color color}) get _style {
    switch (tx.category) {
      case 'wallet_funding':
        return (icon: Icons.add_circle_outline, color: AppColors.secondary);
      case 'withdrawal':
        return (icon: Icons.arrow_upward, color: AppColors.error);
      case 'service_payment':
        return (icon: Icons.payments_outlined, color: AppColors.primary);
      case 'refund':
        return (icon: Icons.replay, color: AppColors.tertiary);
      default:
        return (icon: Icons.swap_horiz, color: AppColors.outline);
    }
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final isCredit = tx.type == 'credit';
    final naira = tx.amountKobo / 100;
    final formattedAmount =
        '${isCredit ? '+' : '-'}₦${naira.toStringAsFixed(2).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d)\.)'), (m) => '${m[1]},')}';
    final style = _style;

    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: style.color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppRadii.md),
              ),
              child: Icon(style.icon, size: 20, color: style.color),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    tx.description,
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(_formattedDate(tx.createdAt), style: textTheme.bodySmall),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  formattedAmount,
                  style: textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: isCredit ? AppColors.secondary : AppColors.error,
                  ),
                ),
                if (tx.status != 'success')
                  Text(
                    tx.status[0].toUpperCase() + tx.status.substring(1),
                    style: textTheme.bodySmall?.copyWith(
                      color: AppColors.outline,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formattedDate(DateTime date) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    final local = date.toLocal();
    return '${local.day.toString().padLeft(2, '0')} ${months[local.month - 1]} ${local.year}';
  }
}
