import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/notification_item.dart';
import '../providers/notification_provider.dart';
import '../theme/app_theme.dart';

({IconData icon, Color iconColor, Color iconBackground}) _styleForType(String type) {
  switch (type) {
    case 'wallet':
      return (
        icon: Icons.account_balance_wallet_outlined,
        iconColor: AppColors.secondary,
        iconBackground: AppColors.secondaryContainer,
      );
    case 'appointment':
      return (
        icon: Icons.event_available_outlined,
        iconColor: AppColors.tertiary,
        iconBackground: const Color(0xFFDAE2FD),
      );
    case 'lab_result':
      return (
        icon: Icons.science_outlined,
        iconColor: AppColors.primary,
        iconBackground: AppColors.primaryContainer,
      );
    case 'medication_reminder':
      return (
        icon: Icons.medication_outlined,
        iconColor: AppColors.error,
        iconBackground: AppColors.errorContainer,
      );
    default:
      return (
        icon: Icons.notifications_none,
        iconColor: AppColors.onSurfaceVariant,
        iconBackground: AppColors.surfaceContainerHigh,
      );
  }
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationProvider>().refresh();
    });
  }

  @override
  Widget build(BuildContext context) {
    final notifications = context.watch<NotificationProvider>();
    final isEmpty =
        notifications.today.isEmpty && notifications.yesterday.isEmpty && notifications.earlier.isEmpty;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: () => context.read<NotificationProvider>().markAllRead(),
            child: const Text('Clear All'),
          ),
        ],
      ),
      body: SafeArea(
        child: notifications.isLoading && isEmpty
            ? const Center(child: CircularProgressIndicator())
            : isEmpty
                ? Center(
                    child: Text('No notifications yet.', style: Theme.of(context).textTheme.bodyMedium),
                  )
                : ListView(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    children: [
                      if (notifications.today.isNotEmpty) ...[
                        const _SectionLabel('TODAY'),
                        for (final n in notifications.today) _NotificationTile(notification: n),
                        const SizedBox(height: AppSpacing.md),
                      ],
                      if (notifications.yesterday.isNotEmpty) ...[
                        const _SectionLabel('YESTERDAY'),
                        for (final n in notifications.yesterday) _NotificationTile(notification: n),
                        const SizedBox(height: AppSpacing.md),
                      ],
                      if (notifications.earlier.isNotEmpty) ...[
                        const _SectionLabel('EARLIER'),
                        for (final n in notifications.earlier) _NotificationTile(notification: n),
                      ],
                    ],
                  ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Text(label, style: Theme.of(context).textTheme.labelSmall),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({required this.notification});

  final NotificationItem notification;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final style = _styleForType(notification.type);

    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadii.lg),
        onTap: () {
          context.read<NotificationProvider>().markAllRead();
          if (notification.type == 'invite') context.push('/invitations');
        },
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: style.iconBackground,
                  borderRadius: BorderRadius.circular(AppRadii.md),
                ),
                child: Icon(style.icon, size: 20, color: style.iconColor),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            notification.title,
                            style: textTheme.bodyMedium?.copyWith(
                              fontWeight: notification.isRead ? FontWeight.w500 : FontWeight.w700,
                            ),
                          ),
                        ),
                        Text(DateFormat('h:mm a').format(notification.createdAt.toLocal()),
                            style: textTheme.bodySmall),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(notification.body, style: textTheme.bodySmall),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
