import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/partner_provider.dart';
import '../theme/app_theme.dart';

class PartnerFeedbackChatScreen extends StatelessWidget {
  const PartnerFeedbackChatScreen({super.key, required this.patientId});
  
  final String patientId;

  String _formatDateHeader(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0 && now.day == date.day) {
      return 'Today';
    } else if (difference.inDays == 1 ||
        (difference.inDays == 0 && now.day != date.day)) {
      return 'Yesterday';
    } else {
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${date.day} ${months[date.month - 1]}, ${date.year}';
    }
  }

  @override
  Widget build(BuildContext context) {
    final partner = context.watch<PartnerProvider>();
    final groupIndex = partner.feedbacks.indexWhere((g) => g.patientId == patientId);
    
    if (groupIndex == -1) {
      return Scaffold(
        appBar: AppBar(title: const Text('Feedback')),
        body: const Center(child: Text('Patient not found or no feedbacks.')),
      );
    }
    
    final group = partner.feedbacks[groupIndex];
    // Reverse the logs so the oldest is at the top (like a chat)
    final logs = group.logs.reversed.toList();

    return Scaffold(
      backgroundColor: AppColors.surfaceContainerLowest,
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppColors.secondaryContainer,
              child: Text(
                group.patientName.isNotEmpty ? group.patientName[0].toUpperCase() : '?',
                style: const TextStyle(
                  color: AppColors.onSecondaryContainer,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Text(group.patientName, style: const TextStyle(fontSize: 16)),
          ],
        ),
        titleSpacing: 0,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.lg),
        itemCount: logs.length,
        itemBuilder: (ctx, i) {
          final log = logs[i];
          final showDateHeader = i == 0 ||
              logs[i - 1].createdAt.day != log.createdAt.day ||
              logs[i - 1].createdAt.month != log.createdAt.month ||
              logs[i - 1].createdAt.year != log.createdAt.year;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (showDateHeader)
                Center(
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerHigh,
                      borderRadius: BorderRadius.circular(AppRadii.full),
                    ),
                    child: Text(
                      _formatDateHeader(log.createdAt),
                      style: Theme.of(context).textTheme.labelSmall,
                    ),
                  ),
                ),
              
              // Chat bubble
              Align(
                alignment: Alignment.centerLeft, // Since it's from patient to partner
                child: Container(
                  margin: const EdgeInsets.only(bottom: AppSpacing.sm, right: 40),
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: const BoxDecoration(
                    color: AppColors.surfaceContainerHigh,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(AppRadii.lg),
                      topRight: Radius.circular(AppRadii.lg),
                      bottomRight: Radius.circular(AppRadii.lg),
                      bottomLeft: Radius.circular(0),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            log.mood.toLowerCase() == 'happy'
                                ? Icons.sentiment_very_satisfied
                                : log.mood.toLowerCase() == 'neutral'
                                    ? Icons.sentiment_neutral
                                    : Icons.sentiment_dissatisfied,
                            size: 16,
                            color: log.mood.toLowerCase() == 'happy'
                                ? Colors.green
                                : log.mood.toLowerCase() == 'neutral'
                                    ? Colors.amber
                                    : Colors.red,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            log.mood,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ],
                      ),
                      if (log.note != null && log.note!.isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          log.note!,
                          style: const TextStyle(fontSize: 14),
                        ),
                      ],
                      const SizedBox(height: 4),
                      Align(
                        alignment: Alignment.bottomRight,
                        child: Text(
                          '${log.createdAt.hour.toString().padLeft(2, '0')}:${log.createdAt.minute.toString().padLeft(2, '0')}',
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.outline, fontSize: 10),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
