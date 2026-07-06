import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/vault_models.dart';
import '../providers/vault_provider.dart';
import '../theme/app_theme.dart';

/// A single vault folder's contents - uploads always go into this folder,
/// there's no "pick a category" step anymore. This is what "Scan/Upload"
/// on the Vault tab used to do directly (flat, uncategorized); now a
/// folder must exist first.
class VaultFolderScreen extends StatefulWidget {
  const VaultFolderScreen({super.key, required this.folder});

  final VaultFolder folder;

  @override
  State<VaultFolderScreen> createState() => _VaultFolderScreenState();
}

class _VaultFolderScreenState extends State<VaultFolderScreen> {
  bool _uploading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<VaultProvider>().loadFolderFiles(widget.folder.id);
    });
  }

  String _guessMimeType(String? extension) {
    switch (extension?.toLowerCase()) {
      case 'pdf':
        return 'application/pdf';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      default:
        return 'application/octet-stream';
    }
  }

  Future<void> _showScanOrUploadOptions() async {
    final action = await showModalBottomSheet<String>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Padding(
              padding: EdgeInsets.all(AppSpacing.md),
              child: Text('Choose an Option', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined, color: AppColors.primary),
              title: const Text('Scan Document (Camera)'),
              onTap: () => Navigator.of(context).pop('scan'),
            ),
            ListTile(
              leading: const Icon(Icons.upload_file, color: AppColors.primary),
              title: const Text('Upload File (Gallery/Local)'),
              onTap: () => Navigator.of(context).pop('upload'),
            ),
          ],
        ),
      ),
    );

    if (!mounted) return;
    if (action == 'scan') {
      context.push('/scan-upload');
    } else if (action == 'upload') {
      _pickAndUpload();
    }
  }

  Future<void> _pickAndUpload() async {
    final result = await FilePicker.platform.pickFiles(withData: true);
    final file = result?.files.single;
    if (file?.bytes == null) return;

    setState(() => _uploading = true);
    final success = await context.read<VaultProvider>().uploadFile(
          fileName: file!.name,
          mimeType: _guessMimeType(file.extension),
          bytes: file.bytes as Uint8List,
          category: widget.folder.name,
          folderId: widget.folder.id,
        );
    if (!mounted) return;
    setState(() => _uploading = false);

    final vault = context.read<VaultProvider>();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(success ? 'Document uploaded successfully.' : vault.errorMessage ?? 'Upload failed.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final vault = context.watch<VaultProvider>();

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text(widget.folder.name),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _uploading ? null : _showScanOrUploadOptions,
        icon: _uploading
            ? const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              )
            : const Icon(Icons.upload_file),
        label: Text(_uploading ? 'Uploading…' : 'Upload'),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => context.read<VaultProvider>().loadFolderFiles(widget.folder.id),
          child: vault.isLoadingFolderFiles && vault.currentFolderFiles.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : vault.currentFolderFiles.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(AppSpacing.xl),
                          child: Text(
                            'No documents in this folder yet — upload your first file.',
                            style: textTheme.bodyMedium,
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    )
                  : ListView.separated(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      itemCount: vault.currentFolderFiles.length,
                      separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
                      itemBuilder: (context, index) {
                        final file = vault.currentFolderFiles[index];
                        return Card(
                          child: ListTile(
                            leading: Icon(
                              file.fileName.toLowerCase().endsWith('.pdf') ? Icons.picture_as_pdf : Icons.image,
                              color: AppColors.primary,
                            ),
                            title: Text(file.fileName, maxLines: 1, overflow: TextOverflow.ellipsis),
                          ),
                        );
                      },
                    ),
        ),
      ),
    );
  }
}
