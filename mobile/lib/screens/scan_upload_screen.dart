import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_theme.dart';

class ScanUploadScreen extends StatefulWidget {
  const ScanUploadScreen({super.key});

  @override
  State<ScanUploadScreen> createState() => _ScanUploadScreenState();
}

class _ScanUploadScreenState extends State<ScanUploadScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _scannerAnimationController;
  late Animation<double> _scannerAnimation;

  @override
  void initState() {
    super.initState();
    _scannerAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);

    _scannerAnimation = Tween<double>(
      begin: 0.1,
      end: 0.9,
    ).animate(_scannerAnimationController);
  }

  @override
  void dispose() {
    _scannerAnimationController.dispose();
    super.dispose();
  }

  void _onCapture() {
    // Screen flash effect simulation
    showGeneralDialog(
      context: context,
      barrierColor: Colors.white,
      barrierDismissible: false,
      transitionDuration: const Duration(milliseconds: 100),
      pageBuilder: (context, anim1, anim2) => const SizedBox.expand(),
    );

    Future.delayed(const Duration(milliseconds: 150), () {
      if (mounted) {
        Navigator.of(context).pop(); // Dismiss flash
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Document captured! Saving to vault...'),
          ),
        );
        context.pop(); // Return to previous screen
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.primaryContainer),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'Add New Record',
          style: TextStyle(color: Colors.white),
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.help_outline,
              color: AppColors.primaryContainer,
            ),
            onPressed: () {},
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: AspectRatio(
                  aspectRatio: 3 / 4,
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(AppRadii.lg),
                      color: Colors.grey[900],
                      image: const DecorationImage(
                        image: NetworkImage(
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuAZvHRCRtgl8zzpP2EE-JimjnMZo8kJ_btlqaBAIffwsdmYLnaXuXsHKV_JPm53wtZ2bSkxMSxngkET-2yVfrhxEBcgdfs2n7GK-pPHx6A6sPccpWguEjb4-BmnLvxNrK2vKB5ZRKpnDeDizAG9cQyr-LNiC44gvcoh755C63Krwunx4a6KIYpbyUUuniCUH4fsQWdkrxs_GHwlmaCrxoSA47BCHEFo0EqCkO-v_OZzDU49xrmo1gcSfOpC_Bilg3VutAkTp4J-uHI',
                        ),
                        fit: BoxFit.cover,
                        opacity: 0.8,
                      ),
                    ),
                    child: Stack(
                      children: [
                        // Scanning line animation
                        AnimatedBuilder(
                          animation: _scannerAnimation,
                          builder: (context, child) {
                            return Positioned(
                              top:
                                  MediaQuery.of(context).size.height *
                                  0.45 *
                                  _scannerAnimation.value,
                              left: AppSpacing.lg,
                              right: AppSpacing.lg,
                              child: Container(
                                height: 4,
                                decoration: BoxDecoration(
                                  color: AppColors.primaryContainer.withValues(
                                    alpha: 0.6,
                                  ),
                                  borderRadius: BorderRadius.circular(2),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.primaryContainer,
                                      blurRadius: 15,
                                      spreadRadius: 2,
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                        // Corner borders overlay
                        const Positioned(
                          top: AppSpacing.md,
                          left: AppSpacing.md,
                          child: Icon(
                            Icons.crop_free,
                            color: AppColors.primaryContainer,
                            size: 40,
                          ),
                        ),
                        // Text Instruction Overlay
                        Positioned(
                          bottom: AppSpacing.xl * 2,
                          left: 0,
                          right: 0,
                          child: Center(
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.lg,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.black54,
                                borderRadius: BorderRadius.circular(
                                  AppRadii.full,
                                ),
                                border: Border.all(color: Colors.white12),
                              ),
                              child: const Text(
                                'Align document with edges',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ),
                        // Camera control buttons
                        Positioned(
                          bottom: AppSpacing.lg,
                          left: 0,
                          right: 0,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              IconButton(
                                icon: const Icon(
                                  Icons.flash_auto,
                                  color: Colors.white,
                                ),
                                onPressed: () {},
                              ),
                              GestureDetector(
                                onTap: _onCapture,
                                child: Container(
                                  width: 72,
                                  height: 72,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: Colors.white54,
                                      width: 4,
                                    ),
                                  ),
                                  child: const Center(
                                    child: CircleAvatar(
                                      radius: 28,
                                      backgroundColor: Colors.white,
                                    ),
                                  ),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(
                                  Icons.grid_on,
                                  color: Colors.white,
                                ),
                                onPressed: () {},
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // Bottom utility options
            Container(
              color: Colors.black,
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: () {},
                          child: Container(
                            padding: const EdgeInsets.all(AppSpacing.md),
                            decoration: BoxDecoration(
                              color: Colors.grey[900],
                              borderRadius: BorderRadius.circular(AppRadii.lg),
                              border: Border.all(color: Colors.white10),
                            ),
                            child: const Column(
                              children: [
                                Icon(
                                  Icons.image,
                                  color: AppColors.secondaryContainer,
                                ),
                                SizedBox(height: 4),
                                Text(
                                  'Gallery',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  'Upload photos',
                                  style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: InkWell(
                          onTap: () {},
                          child: Container(
                            padding: const EdgeInsets.all(AppSpacing.md),
                            decoration: BoxDecoration(
                              color: Colors.grey[900],
                              borderRadius: BorderRadius.circular(AppRadii.lg),
                              border: Border.all(color: Colors.white10),
                            ),
                            child: const Column(
                              children: [
                                Icon(
                                  Icons.cloud_upload,
                                  color: AppColors.primaryContainer,
                                ),
                                SizedBox(height: 4),
                                Text(
                                  'Cloud Import',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  'Drive, Dropbox',
                                  style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  // Scanning Tips Section
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.primaryContainer.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(AppRadii.lg),
                      border: Border.all(
                        color: AppColors.primaryContainer.withValues(
                          alpha: 0.2,
                        ),
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.info,
                          color: AppColors.primaryContainer,
                          size: 20,
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Scanning Tips',
                                style: TextStyle(
                                  color: AppColors.primaryContainer,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Hold your phone steady and ensure there is enough light. Our AI will automatically detect edges and enhance text clarity for your medical vault.',
                                style: textTheme.bodySmall?.copyWith(
                                  color: Colors.grey[300],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
