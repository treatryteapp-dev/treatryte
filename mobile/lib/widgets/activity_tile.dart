import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/activity_item.dart';
import '../providers/main_tab_provider.dart';
import '../providers/vault_provider.dart';
import '../theme/app_theme.dart';

/// Routes to wherever an activity is best followed up on. When it links back
/// to a specific vault file (refCollection/refId), that exact document is
/// opened directly rather than just landing on the Vault tab. Several other
/// activity types (wallet transactions, appointments) don't have a
/// dedicated detail screen yet, so they fall back to the tab that shows
/// their summary rather than doing nothing.
Future<void> handleActivityTap(BuildContext context, ActivityItem item) async {
  if (item.type == 'lab_upload' &&
      item.refCollection == 'vault_files' &&
      item.refId != null) {
    final file = await context.read<VaultProvider>().getFile(item.refId!);
    if (!context.mounted) return;
    if (file?.url != null && file!.url!.isNotEmpty) {
      final opened = await launchUrl(
        Uri.parse(file.url!),
        mode: LaunchMode.externalApplication,
      );
      if (!context.mounted || opened) return;
    }
    // File was deleted, no longer accessible, or couldn't be opened - fall
    // through to the Vault tab rather than leaving the tap looking dead.
    context.read<MainTabProvider>().setIndex(1);
    return;
  }

  switch (item.type) {
    case 'lab_upload':
      context.read<MainTabProvider>().setIndex(1); // Vault
      break;
    case 'medication_taken':
      context.read<MainTabProvider>().setIndex(3); // Meds
      break;
    case 'subscription_upgrade':
      context.push('/subscription-plans');
      break;
    case 'wallet_funding':
    case 'wallet_withdrawal':
    case 'service_payment':
      context.read<MainTabProvider>().setIndex(0); // Home (wallet/summary)
      break;
    case 'appointment_booked':
      context.push('/appointments');
      break;
    default:
      break;
  }
}

class ActivityTile extends StatelessWidget {
  const ActivityTile({
    super.key,
    required this.icon,
    required this.iconColor,
    required this.iconBackground,
    required this.title,
    required this.subtitle,
    this.onTap,
  });

  final IconData icon;
  final Color iconColor;
  final Color iconBackground;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return InkWell(
      borderRadius: BorderRadius.circular(AppRadii.md),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: iconBackground,
                borderRadius: BorderRadius.circular(AppRadii.md),
              ),
              child: Icon(icon, size: 20, color: iconColor),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.onSurface,
                    ),
                  ),
                  Text(subtitle, style: textTheme.bodySmall),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.outline),
          ],
        ),
      ),
    );
  }
}
