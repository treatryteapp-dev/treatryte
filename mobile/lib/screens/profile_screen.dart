import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _uploadingAvatar = false;

  String _initials(String fullName) {
    final parts = fullName.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return (parts.first[0] + parts.last[0]).toUpperCase();
  }

  String _roleLabel(String role) {
    switch (role) {
      case 'provider':
        return 'Partner Account';
      case 'admin':
        return 'Administrator';
      default:
        return 'Patient Account';
    }
  }

  String _guessMimeType(String? extension) {
    switch (extension?.toLowerCase()) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }

  Future<void> _pickAvatar() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      withData: true,
    );
    final file = result?.files.single;
    if (file?.bytes == null || !mounted) return;

    setState(() => _uploadingAvatar = true);
    final ok = await context.read<AuthProvider>().updateAvatar(
          fileName: file!.name,
          mimeType: _guessMimeType(file.extension),
          bytes: file.bytes as Uint8List,
        );
    if (!mounted) return;
    setState(() => _uploadingAvatar = false);

    if (!ok) {
      final error = context.read<AuthProvider>().errorMessage;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error ?? 'Failed to update profile picture')),
      );
    }
  }

  Future<void> _confirmLogout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Log Out'),
        content: const Text('Are you sure you want to log out of TreatRyte?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(dialogContext).pop(false), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            style: FilledButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Log Out'),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;
    await context.read<AuthProvider>().logout();
    if (context.mounted) context.go('/login');
  }

  Future<void> _confirmDeleteAccount(BuildContext context) async {
    final passwordController = TextEditingController();
    var obscure = true;
    var submitting = false;
    String? error;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: const Text('Delete Account'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'This permanently deactivates your TreatRyte account and cannot be undone. '
                'If your wallet has a balance, withdraw it first - deletion is blocked otherwise.',
              ),
              const SizedBox(height: AppSpacing.md),
              TextField(
                controller: passwordController,
                obscureText: obscure,
                decoration: InputDecoration(
                  labelText: 'Confirm your password',
                  errorText: error,
                  suffixIcon: IconButton(
                    icon: Icon(obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                    onPressed: () => setDialogState(() => obscure = !obscure),
                  ),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: submitting ? null : () => Navigator.of(dialogContext).pop(false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: submitting
                  ? null
                  : () async {
                      if (passwordController.text.isEmpty) {
                        setDialogState(() => error = 'Required');
                        return;
                      }
                      setDialogState(() {
                        submitting = true;
                        error = null;
                      });
                      final ok = await context.read<AuthProvider>().deleteAccount(passwordController.text);
                      if (ok) {
                        if (dialogContext.mounted) Navigator.of(dialogContext).pop(true);
                        return;
                      }
                      setDialogState(() {
                        submitting = false;
                        error = context.read<AuthProvider>().errorMessage ?? 'Failed to delete account';
                      });
                    },
              style: FilledButton.styleFrom(backgroundColor: AppColors.error),
              child: submitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Delete Account'),
            ),
          ],
        ),
      ),
    );

    if (confirmed == true && context.mounted) {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final user = context.watch<AuthProvider>().currentUser;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Profile'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            Center(
              child: GestureDetector(
                onTap: _uploadingAvatar ? null : _pickAvatar,
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: AppColors.primaryContainer,
                      backgroundImage: user?.avatarUrl != null ? NetworkImage(user!.avatarUrl!) : null,
                      child: _uploadingAvatar
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : user?.avatarUrl == null
                              ? Text(
                                  _initials(user?.fullName ?? '?'),
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 24),
                                )
                              : null,
                    ),
                    Positioned(
                      bottom: -2,
                      right: -2,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                        child: const Icon(Icons.camera_alt, size: 14, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Center(
              child: Text(user?.fullName ?? 'Unknown', style: textTheme.headlineSmall),
            ),
            const SizedBox(height: 4),
            Center(
              child: Text(
                _roleLabel(user?.role ?? 'patient'),
                style: textTheme.bodySmall?.copyWith(color: AppColors.onSurfaceVariant),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.email_outlined, color: AppColors.primary),
                    title: const Text('Email'),
                    subtitle: Text(user?.email ?? '-'),
                  ),
                  const Divider(height: 1, indent: 16, endIndent: 16),
                  ListTile(
                    leading: const Icon(Icons.badge_outlined, color: AppColors.primary),
                    title: const Text('Account Type'),
                    subtitle: Text(_roleLabel(user?.role ?? 'patient')),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            OutlinedButton.icon(
              onPressed: () => _confirmLogout(context),
              icon: const Icon(Icons.logout, color: AppColors.error),
              label: const Text('Log Out', style: TextStyle(color: AppColors.error)),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(48),
                side: const BorderSide(color: AppColors.error),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            TextButton.icon(
              onPressed: () => _confirmDeleteAccount(context),
              icon: const Icon(Icons.delete_forever_outlined, color: AppColors.error),
              label: const Text('Delete Account', style: TextStyle(color: AppColors.error)),
              style: TextButton.styleFrom(minimumSize: const Size.fromHeight(48)),
            ),
          ],
        ),
      ),
    );
  }
}
