import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../models/transaction.dart';
import '../../providers/partner_provider.dart';
import '../../providers/wallet_provider.dart';
import '../../theme/app_theme.dart';

class PartnerWalletTab extends StatefulWidget {
  const PartnerWalletTab({super.key});

  @override
  State<PartnerWalletTab> createState() => _PartnerWalletTabState();
}

class _PartnerWalletTabState extends State<PartnerWalletTab> {
  bool _loaded = false;

  @override
  Widget build(BuildContext context) {
    // Trigger a single load on first render.
    if (!_loaded) {
      _loaded = true;
      final walletProvider = context.read<WalletProvider>();
      Future.microtask(() => walletProvider.refresh());
    }

    final textTheme = Theme.of(context).textTheme;
    final wallet = context.watch<WalletProvider>();
    final lab = context.watch<PartnerProvider>().lab;
    final status = lab?.status;
    final (statusLabel, statusColor, statusIcon) = switch (status) {
      'approved' => ('Fully Verified', AppColors.secondary, Icons.verified),
      'rejected' => (
        'Verification Rejected',
        AppColors.error,
        Icons.error_outline,
      ),
      _ => (
        'Verification Pending',
        AppColors.onSurfaceVariant,
        Icons.hourglass_top,
      ),
    };

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => context.read<WalletProvider>().refresh(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Financial Overview', style: textTheme.headlineSmall),
              const SizedBox(height: 2),
              Text(
                'Manage your earnings and settlement history.',
                style: textTheme.bodySmall,
              ),
              const SizedBox(height: AppSpacing.lg),

              // ── Wallet Balance Card ──────────────────────────────────────
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppColors.primaryContainer, AppColors.primary],
                  ),
                  borderRadius: BorderRadius.circular(AppRadii.lg),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.account_balance_wallet_outlined,
                          color: Colors.white70,
                          size: 18,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Text(
                          'NOMBA PARTNER WALLET',
                          style: textTheme.labelSmall?.copyWith(
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    const Text(
                      'Wallet Balance',
                      style: TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                    if (wallet.isLoading)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 6),
                        child: SizedBox(
                          height: 28,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        ),
                      )
                    else if (wallet.errorMessage != null)
                      Text(
                        'Balance unavailable',
                        style: const TextStyle(
                          color: Colors.white60,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      )
                    else
                      Text(
                        wallet.formattedBalance,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    const SizedBox(height: AppSpacing.md),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => context.push('/fund-wallet'),
                            icon: const Icon(
                              Icons.add,
                              size: 16,
                              color: Colors.white,
                            ),
                            label: const Text('Add Funds'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white,
                              side: const BorderSide(color: Colors.white54),
                              minimumSize: const Size.fromHeight(44),
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => context.push('/withdraw-pay'),
                            icon: const Icon(Icons.arrow_upward, size: 16),
                            label: const Text('Withdraw'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: AppColors.primary,
                              minimumSize: const Size.fromHeight(44),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              // ── Settlement Info ──────────────────────────────────────────
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.sm),
                        decoration: BoxDecoration(
                          color: AppColors.secondary.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.autorenew,
                          color: AppColors.secondary,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Next Payout',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            Text(
                              'Automatic — Nomba Bank settlement',
                              style: TextStyle(
                                color: AppColors.outline,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              // ── Security Status ──────────────────────────────────────────
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Row(
                    children: [
                      Icon(statusIcon, color: statusColor),
                      const SizedBox(width: AppSpacing.md),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Security Status',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          Text(
                            statusLabel,
                            style: textTheme.bodySmall?.copyWith(
                              color: statusColor,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              // ── Transactions ─────────────────────────────────────────────
              Row(
                children: [
                  Text('Recent Transactions', style: textTheme.headlineSmall),
                  const Spacer(),
                  if (wallet.isLoading && wallet.transactions.isNotEmpty)
                    const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),

              if (wallet.errorMessage != null)
                _ErrorBanner(
                  message: wallet.errorMessage!,
                  onRetry: () => context.read<WalletProvider>().refresh(),
                )
              else if (!wallet.isLoading && wallet.transactions.isEmpty)
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Center(
                      child: Text(
                        'No transactions yet.',
                        style: textTheme.bodySmall,
                      ),
                    ),
                  ),
                )
              else
                Card(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                    ),
                    child: Column(
                      children: [
                        // Show up to the most recent 10 transactions
                        for (
                          int i = 0;
                          i < wallet.transactions.length && i < 10;
                          i++
                        ) ...[
                          if (i > 0) const Divider(height: 1),
                          _buildTxTile(wallet.transactions[i]),
                        ],
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTxTile(WalletTransaction tx) {
    final isCredit = tx.type == 'credit';
    final amountNaira = tx.amountKobo / 100;
    final formattedAmount =
        '${isCredit ? '+' : '-'}₦${amountNaira.toStringAsFixed(2).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d)\.)'), (m) => '${m[1]},')}';

    final day = tx.createdAt.day.toString().padLeft(2, '0');
    final month = _monthName(tx.createdAt.month);
    final year = tx.createdAt.year;
    final formattedDate = '$day $month $year';

    // Pick an icon based on category
    IconData iconData;
    Color iconColor;
    switch (tx.category.toLowerCase()) {
      case 'funding':
        iconData = Icons.add_circle_outline;
        iconColor = AppColors.secondary;
      case 'withdrawal':
        iconData = Icons.arrow_upward;
        iconColor = AppColors.error;
      case 'payment':
        iconData = Icons.payments_outlined;
        iconColor = AppColors.primary;
      default:
        iconData = Icons.swap_horiz;
        iconColor = AppColors.outline;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(iconData, color: iconColor, size: 18),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tx.description.isNotEmpty ? tx.description : tx.category,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  formattedDate,
                  style: const TextStyle(
                    color: AppColors.outline,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                formattedAmount,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isCredit ? AppColors.secondary : AppColors.error,
                  fontSize: 14,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: tx.status == 'successful'
                      ? AppColors.secondary.withValues(alpha: 0.1)
                      : AppColors.outline.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadii.full),
                ),
                child: Text(
                  tx.status,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: tx.status == 'successful'
                        ? AppColors.secondary
                        : AppColors.outline,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _monthName(int month) {
    const names = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return names[month - 1];
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColors.errorContainer,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            const Icon(Icons.error_outline, color: AppColors.onErrorContainer),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  color: AppColors.onErrorContainer,
                  fontSize: 13,
                ),
              ),
            ),
            TextButton(onPressed: onRetry, child: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}
