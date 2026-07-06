import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/connection_models.dart';
import '../models/vault_models.dart';
import '../providers/connection_provider.dart';
import '../providers/vault_provider.dart';
import '../theme/app_theme.dart';

/// Lists every partner connection request for this patient. A partner
/// inviting a patient doesn't grant them anything by itself - the patient
/// must explicitly accept here and choose exactly what to share.
class InvitationsScreen extends StatefulWidget {
  const InvitationsScreen({super.key});

  @override
  State<InvitationsScreen> createState() => _InvitationsScreenState();
}

class _InvitationsScreenState extends State<InvitationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ConnectionProvider>().refresh();
      context.read<VaultProvider>().refresh();
    });
  }

  Future<void> _respond(PartnerConnection connection) async {
    final connections = context.read<ConnectionProvider>();
    final vault = context.read<VaultProvider>();

    final action = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) =>
          _AcceptSheet(connection: connection, folders: vault.folders),
    );

    if (action == null) return;
    if (action == 'decline') {
      final ok = await connections.decline(connection.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            ok ? '${connection.labName} declined.' : 'Failed to decline.',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final connections = context.watch<ConnectionProvider>();
    final pending = connections.pending;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Invitations'),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => context.read<ConnectionProvider>().refresh(),
          child: connections.isLoading && pending.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : pending.isEmpty
              ? ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(AppSpacing.xl),
                      child: Text(
                        'No pending invitations.',
                        style: textTheme.bodyMedium,
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                )
              : ListView.separated(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  itemCount: pending.length,
                  separatorBuilder: (_, _) =>
                      const SizedBox(height: AppSpacing.sm),
                  itemBuilder: (context, index) {
                    final connection = pending[index];
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              connection.labName,
                              style: textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Wants to connect and view shared medical records.',
                              style: textTheme.bodySmall,
                            ),
                            const SizedBox(height: AppSpacing.md),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () => _respond(connection),
                                child: const Text('Review Request'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ),
    );
  }
}

class _AcceptSheet extends StatefulWidget {
  const _AcceptSheet({required this.connection, required this.folders});

  final PartnerConnection connection;
  final List<VaultFolder> folders;

  @override
  State<_AcceptSheet> createState() => _AcceptSheetState();
}

class _AcceptSheetState extends State<_AcceptSheet> {
  bool _shareAll = true;
  final Set<String> _selectedFolderIds = {};
  bool _submitting = false;

  Future<void> _accept() async {
    setState(() => _submitting = true);
    final ok = await context.read<ConnectionProvider>().accept(
      widget.connection.id,
      shareAll: _shareAll,
      folderIds: _shareAll ? null : _selectedFolderIds.toList(),
    );
    if (!mounted) return;
    setState(() => _submitting = false);
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          ok ? '${widget.connection.labName} accepted.' : 'Failed to accept.',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        decoration: const BoxDecoration(
          color: AppColors.surfaceContainerLowest,
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppRadii.xl),
          ),
        ),
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.md,
          AppSpacing.lg,
          AppSpacing.xl,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Share with ${widget.connection.labName}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Choose what this partner can see. You can change this later.',
              style: textTheme.bodySmall,
            ),
            const SizedBox(height: AppSpacing.md),
            RadioListTile<bool>(
              value: true,
              groupValue: _shareAll,
              onChanged: (v) => setState(() => _shareAll = v ?? true),
              title: const Text('Share all folders'),
              contentPadding: EdgeInsets.zero,
            ),
            RadioListTile<bool>(
              value: false,
              groupValue: _shareAll,
              onChanged: (v) => setState(() => _shareAll = v ?? false),
              title: const Text('Choose specific folders'),
              contentPadding: EdgeInsets.zero,
            ),
            if (!_shareAll)
              if (widget.folders.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                  child: Text(
                    'You have no folders yet.',
                    style: textTheme.bodySmall,
                  ),
                )
              else
                for (final folder in widget.folders)
                  CheckboxListTile(
                    value: _selectedFolderIds.contains(folder.id),
                    onChanged: (checked) => setState(() {
                      if (checked == true) {
                        _selectedFolderIds.add(folder.id);
                      } else {
                        _selectedFolderIds.remove(folder.id);
                      }
                    }),
                    title: Text(folder.name),
                    contentPadding: EdgeInsets.zero,
                    controlAffinity: ListTileControlAffinity.leading,
                  ),
            const SizedBox(height: AppSpacing.lg),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _submitting
                        ? null
                        : () {
                            Navigator.of(context).pop('decline');
                          },
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.error),
                    ),
                    child: const Text(
                      'Decline',
                      style: TextStyle(color: AppColors.error),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: FilledButton(
                    onPressed:
                        (_submitting ||
                            (!_shareAll && _selectedFolderIds.isEmpty))
                        ? null
                        : _accept,
                    child: _submitting
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text('Accept'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
