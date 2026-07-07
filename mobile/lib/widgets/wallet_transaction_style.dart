import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Icon/color for a wallet transaction row, keyed off the real category
/// values backend/src/services/wallet.service.js writes:
/// 'wallet_funding', 'withdrawal', 'service_payment', 'refund'.
({IconData icon, Color color}) walletTransactionStyle(String category) {
  switch (category) {
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
