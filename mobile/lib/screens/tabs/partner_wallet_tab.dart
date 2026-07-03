import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class PartnerWalletTab extends StatelessWidget {
  const PartnerWalletTab({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Financial Overview', style: textTheme.headlineSmall),
            const SizedBox(height: 2),
            Text('Manage your earnings and settlement history.', style: textTheme.bodySmall),
            const SizedBox(height: AppSpacing.lg),

            // Nomba Wallet Card
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
                      const Icon(Icons.account_balance_wallet_outlined, color: Colors.white70, size: 18),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        'NOMBA PARTNER WALLET',
                        style: textTheme.labelSmall?.copyWith(color: Colors.white70),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  const Text('Wallet Balance', style: TextStyle(color: Colors.white70, fontSize: 13)),
                  const Text(
                    '₦4,850,200.00',
                    style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.add, size: 16, color: Colors.white),
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
                          onPressed: () {},
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

            // Settlement Schedule Info Card
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
                      child: const Icon(Icons.autorenew, color: AppColors.secondary),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Next Payout', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          Text('Oct 24, 2026', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                          Text('Automatic transfer to Nomba Bank.', style: TextStyle(color: AppColors.outline, fontSize: 12)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.md),

            // Security Status
            Card(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Row(
                  children: [
                    const Icon(Icons.verified, color: AppColors.secondary),
                    const SizedBox(width: AppSpacing.md),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Security Status', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        Text('Fully Verified', style: textTheme.bodySmall?.copyWith(color: AppColors.secondary, fontWeight: FontWeight.bold)),
                      ],
                    )
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            // Recent Transactions
            Text('Recent Transactions', style: textTheme.headlineSmall),
            const SizedBox(height: AppSpacing.sm),
            Card(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Column(
                  children: [
                    _buildTxTile(
                      title: 'Payment from Chinua Achebe',
                      date: 'Oct 22, 2026',
                      amount: '+₦15,000.00',
                      isCredit: true,
                    ),
                    const Divider(),
                    _buildTxTile(
                      title: 'Nomba Bank Settlement',
                      date: 'Oct 21, 2026',
                      amount: '-₦1,200,000.00',
                      isCredit: false,
                    ),
                    const Divider(),
                    _buildTxTile(
                      title: 'Payment from Bello Ibrahim',
                      date: 'Oct 20, 2026',
                      amount: '+₦8,500.00',
                      isCredit: true,
                    ),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildTxTile({
    required String title,
    required String date,
    required String amount,
    required bool isCredit,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              Text(date, style: const TextStyle(color: AppColors.outline, fontSize: 11)),
            ],
          ),
          Text(
            amount,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: isCredit ? AppColors.secondary : AppColors.error,
              fontSize: 14,
            ),
          )
        ],
      ),
    );
  }
}
