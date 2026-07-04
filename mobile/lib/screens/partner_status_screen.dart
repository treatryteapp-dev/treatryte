import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

/// Shown instead of the partner dashboard when a provider's lab is not yet
/// approved - previously there was no such gate at all, so any authenticated
/// provider (pending or rejected) got full dashboard access.
class PartnerStatusScreen extends StatelessWidget {
  const PartnerStatusScreen({super.key, required this.status, this.onRetry});

  /// 'pending' or 'rejected'.
  final String status;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final isRejected = status == 'rejected';
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: (isRejected ? AppColors.error : AppColors.secondaryContainer).withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isRejected ? Icons.cancel_outlined : Icons.hourglass_top_rounded,
                  color: isRejected ? AppColors.error : AppColors.secondary,
                  size: 40,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              Text(
                isRejected ? 'Application Not Approved' : 'Application Under Review',
                style: textTheme.headlineMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                isRejected
                    ? 'Your partner application was not approved. Contact support if you believe this is a mistake.'
                    : 'Your credentials are still being reviewed by our clinical review team. This usually takes 24 to 48 hours - check back soon.',
                style: textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              if (!isRejected && onRetry != null) ...[
                OutlinedButton(
                  onPressed: onRetry,
                  child: const Text('Check Again'),
                ),
                const SizedBox(height: AppSpacing.md),
              ],
              ElevatedButton(
                onPressed: () async {
                  await context.read<AuthProvider>().logout();
                  if (context.mounted) context.go('/login');
                },
                child: const Text('Log Out'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
