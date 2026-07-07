import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../models/vault_models.dart';
import '../../providers/connection_provider.dart';
import '../../providers/vault_provider.dart';
import '../../theme/app_theme.dart';

class VaultTab extends StatefulWidget {
  const VaultTab({super.key});

  @override
  State<VaultTab> createState() => _VaultTabState();
}

class _VaultTabState extends State<VaultTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<VaultProvider>().refresh();
      context.read<ConnectionProvider>().refresh();
    });
  }

  Future<void> _showCreateFolderDialog() async {
    final nameCtrl = TextEditingController();
    final vault = context.read<VaultProvider>();

    final name = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('New Folder'),
        content: TextField(
          controller: nameCtrl,
          autofocus: true,
          decoration: const InputDecoration(
            labelText: 'Folder Name',
            hintText: 'e.g. Lab Results',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(nameCtrl.text.trim()),
            child: const Text('Create'),
          ),
        ],
      ),
    );

    if (name == null || name.isEmpty) return;
    final folder = await vault.createFolder(name);
    if (!mounted) return;
    if (folder == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(vault.errorMessage ?? 'Failed to create folder.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final vault = context.watch<VaultProvider>();
    final stats = vault.stats;
    final folderLimitReached =
        stats?.maxVaultFolders != null &&
        vault.folders.length >= stats!.maxVaultFolders!;
    final pendingInvites = context.watch<ConnectionProvider>().pending;

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => context.read<VaultProvider>().refresh(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.md,
            AppSpacing.lg,
            AppSpacing.xxl,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Medical Vault', style: textTheme.headlineMedium),
              const SizedBox(height: AppSpacing.md),
              if (pendingInvites.isNotEmpty)
                Card(
                  color: AppColors.secondaryContainer.withValues(alpha: 0.4),
                  margin: const EdgeInsets.only(bottom: AppSpacing.md),
                  child: ListTile(
                    leading: const Icon(
                      Icons.mail_outline,
                      color: AppColors.secondary,
                    ),
                    title: Text(
                      '${pendingInvites.length} pending invitation${pendingInvites.length == 1 ? '' : 's'}',
                    ),
                    subtitle: const Text(
                      'Review which partners can see your records.',
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/invitations'),
                  ),
                ),
              _StorageBanner(stats: stats),
              const SizedBox(height: AppSpacing.xl),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Folders', style: textTheme.headlineSmall),
                  TextButton.icon(
                    onPressed: folderLimitReached
                        ? null
                        : _showCreateFolderDialog,
                    icon: const Icon(
                      Icons.create_new_folder_outlined,
                      size: 18,
                    ),
                    label: const Text('New Folder'),
                  ),
                ],
              ),
              if (stats != null)
                Text(
                  stats.maxVaultFolders != null
                      ? '${vault.folders.length} / ${stats.maxVaultFolders} folders used'
                      : '${vault.folders.length} folders',
                  style: textTheme.bodySmall?.copyWith(
                    color: AppColors.outline,
                  ),
                ),
              const SizedBox(height: AppSpacing.sm),
              if (vault.isLoading && vault.folders.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: AppSpacing.lg),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (vault.folders.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                  child: Text(
                    'No folders yet — create one to start organizing your records.',
                    style: textTheme.bodySmall,
                  ),
                )
              else
                for (final folder in vault.folders)
                  Card(
                    margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.xs,
                      ),
                      leading: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: AppColors.secondaryContainer,
                          borderRadius: BorderRadius.circular(AppRadii.md),
                        ),
                        child: const Icon(
                          Icons.folder_outlined,
                          size: 20,
                          color: AppColors.onSecondaryContainer,
                        ),
                      ),
                      title: Text(
                        folder.name,
                        style: textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.onSurface,
                        ),
                      ),
                      subtitle: Text(
                        '${folder.fileCount} Files',
                        style: textTheme.bodySmall,
                      ),
                      trailing: const Icon(
                        Icons.chevron_right,
                        color: AppColors.outline,
                      ),
                      onTap: () => context.push('/vault-folder', extra: folder),
                    ),
                  ),
              if (folderLimitReached)
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.sm),
                  child: Text(
                    'Folder limit reached for your plan. Upgrade to add more.',
                    style: textTheme.bodySmall?.copyWith(
                      color: AppColors.error,
                    ),
                  ),
                ),
              const SizedBox(height: AppSpacing.xxl),
              Text('Connected Partners', style: textTheme.headlineSmall),
              const SizedBox(height: AppSpacing.sm),
              if (context.watch<ConnectionProvider>().accepted.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                  child: Text(
                    'No connected partners yet. Partners who invite you will appear here once accepted.',
                    style: textTheme.bodySmall,
                  ),
                )
              else
                for (final partner
                    in context.watch<ConnectionProvider>().accepted)
                  Card(
                    margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.xs,
                      ),
                      leading: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: AppColors.secondaryContainer,
                          borderRadius: BorderRadius.circular(AppRadii.md),
                        ),
                        child: const Icon(
                          Icons.domain,
                          size: 20,
                          color: AppColors.onSecondaryContainer,
                        ),
                      ),
                      title: Text(
                        partner.labName,
                        style: textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.onSurface,
                        ),
                      ),
                      subtitle: Text(
                        partner.shareAll
                            ? 'Tap to view records • Access to all folders'
                            : 'Tap to view records • ${partner.sharedFolderIds.length} folders shared',
                        style: textTheme.bodySmall,
                      ),
                      trailing: const Icon(
                        Icons.chevron_right,
                        color: AppColors.outline,
                      ),
                      onTap: () => context.push(
                        '/vault/connection/${partner.id}',
                        extra: partner,
                      ),
                    ),
                  ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StorageBanner extends StatelessWidget {
  const _StorageBanner({required this.stats});

  final VaultStats? stats;

  static String _humanSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }

  @override
  Widget build(BuildContext context) {
    final usedBytes = stats?.usedBytes ?? 0;
    final maxFiles = stats?.maxVaultFiles;
    final fileCount = stats?.fileCount ?? 0;
    // The real, enforced quota is a file count per plan (see
    // getVaultLimits() on the backend) - there's no separate byte cap, so
    // the progress bar reflects that instead of a made-up storage ceiling.
    // An unlimited plan (maxFiles == null) shows a full, static bar.
    final fraction = maxFiles == null
        ? 1.0
        : (fileCount / maxFiles).clamp(0.0, 1.0);

    return Container(
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
              const Icon(Icons.shield_outlined, color: Colors.white, size: 18),
              const SizedBox(width: AppSpacing.xs),
              const Text(
                'Your Health Vault is Secure',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          const Text(
            'All documents are encrypted with bank-grade AES-256 encryption.',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: AppSpacing.md),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadii.full),
            child: LinearProgressIndicator(
              value: fraction,
              minHeight: 6,
              backgroundColor: Colors.white24,
              valueColor: const AlwaysStoppedAnimation(Colors.white),
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            '$fileCount${maxFiles != null ? '/$maxFiles' : ''} Files • ${_humanSize(usedBytes)} used',
            style: const TextStyle(color: Colors.white70, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
