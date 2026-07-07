import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

import '../providers/partner_provider.dart';
import '../theme/app_theme.dart';

class PartnerFeedbacksScreen extends StatefulWidget {
  const PartnerFeedbacksScreen({super.key});

  @override
  State<PartnerFeedbacksScreen> createState() => _PartnerFeedbacksScreenState();
}

class _PartnerFeedbacksScreenState extends State<PartnerFeedbacksScreen> {
  String _formatTimeAgo(DateTime date) {
    final difference = DateTime.now().difference(date);
    if (difference.inDays > 8) {
      return '${date.day}/${date.month}/${date.year}';
    } else if ((difference.inDays / 7).floor() >= 1) {
      return '1w ago';
    } else if (difference.inDays >= 2) {
      return '${difference.inDays}d ago';
    } else if (difference.inDays >= 1) {
      return 'Yesterday';
    } else if (difference.inHours >= 2) {
      return '${difference.inHours}h ago';
    } else if (difference.inHours >= 1) {
      return '1h ago';
    } else if (difference.inMinutes >= 2) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inMinutes >= 1) {
      return '1m ago';
    } else if (difference.inSeconds >= 3) {
      return '${difference.inSeconds}s ago';
    } else {
      return 'Just now';
    }
  }

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<PartnerProvider>().loadFeedbacks();
    });
  }

  @override
  Widget build(BuildContext context) {
    final partner = context.watch<PartnerProvider>();
    final isLoading = partner.isLoadingFeedbacks;
    final error = partner.feedbacksError;
    final feedbacks = partner.feedbacks;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Patient Feedbacks'),
      ),
      body: isLoading && feedbacks.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(
                  child: Text(
                    error,
                    style: const TextStyle(color: AppColors.error),
                  ),
                )
              : feedbacks.isEmpty
                  ? const Center(
                      child: Text(
                        'No feedbacks received yet.',
                        style: TextStyle(color: AppColors.outline),
                      ),
                    )
                  : ListView.separated(
                      itemCount: feedbacks.length,
                      separatorBuilder: (ctx, i) => const Divider(height: 1),
                      itemBuilder: (ctx, i) {
                        final group = feedbacks[i];
                        final lastLog = group.logs.first; // Logs are sorted desc

                        return ListTile(
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.lg,
                            vertical: AppSpacing.xs,
                          ),
                          leading: CircleAvatar(
                            radius: 24,
                            backgroundColor: AppColors.secondaryContainer,
                            child: Text(
                              group.patientName.isNotEmpty ? group.patientName[0].toUpperCase() : '?',
                              style: const TextStyle(
                                color: AppColors.onSecondaryContainer,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          title: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                group.patientName,
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              Text(
                                _formatTimeAgo(lastLog.createdAt),
                                style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.outline),
                              ),
                            ],
                          ),
                          subtitle: Text(
                            lastLog.note != null && lastLog.note!.isNotEmpty
                                ? lastLog.note!
                                : 'Mood: ${lastLog.mood}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppColors.onSurfaceVariant,
                                ),
                          ),
                          onTap: () {
                            context.push('/partner-feedbacks/${group.patientId}');
                          },
                        );
                      },
                    ),
    );
  }
}
