import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/activity_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/activity_tile.dart';
import '../widgets/icon_mapper.dart';

class ActivityListScreen extends StatefulWidget {
  const ActivityListScreen({super.key});

  @override
  State<ActivityListScreen> createState() => _ActivityListScreenState();
}

class _ActivityListScreenState extends State<ActivityListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ActivityProvider>().loadAll();
    });
  }

  @override
  Widget build(BuildContext context) {
    final activity = context.watch<ActivityProvider>();
    final isEmpty = activity.all.isEmpty;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Recent Activity'),
      ),
      body: SafeArea(
        child: activity.isLoadingAll && isEmpty
            ? const Center(child: CircularProgressIndicator())
            : isEmpty
            ? Center(
                child: Text(
                  'No recent activity yet.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              )
            : RefreshIndicator(
                onRefresh: () => context.read<ActivityProvider>().loadAll(),
                child: ListView.builder(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  itemCount: activity.all.length,
                  itemBuilder: (context, index) {
                    final item = activity.all[index];
                    return ActivityTile(
                      icon: iconForKey(item.iconKey),
                      iconColor: AppColors.secondary,
                      iconBackground: AppColors.secondaryContainer,
                      title: item.title,
                      subtitle: item.subtitle,
                      onTap: () => handleActivityTap(context, item.type),
                    );
                  },
                ),
              ),
      ),
    );
  }
}
