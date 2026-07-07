import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:timeago/timeago.dart' as timeago;

import '../providers/partner_provider.dart';
import '../theme/app_theme.dart';

class PartnerFeedbacksScreen extends StatefulWidget {
  const PartnerFeedbacksScreen({super.key});

  @override
  State<PartnerFeedbacksScreen> createState() => _PartnerFeedbacksScreenState();
}

class _PartnerFeedbacksScreenState extends State<PartnerFeedbacksScreen> {
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
                                timeago.format(lastLog.createdAt, locale: 'en_short'),
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
