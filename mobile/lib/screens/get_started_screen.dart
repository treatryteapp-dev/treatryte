import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_theme.dart';

class GetStartedScreen extends StatelessWidget {
  const GetStartedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: AppSpacing.xxl),
              ClipRRect(
                borderRadius: BorderRadius.circular(AppRadii.lg),
                child: Image.asset(
                  'asset/logo.jpeg',
                  width: 64,
                  height: 64,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Text('TreatRyte', style: textTheme.displaySmall),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Bridging health and wealth for a\nsustainable future.',
                textAlign: TextAlign.center,
                style: textTheme.bodyMedium,
              ),
              const SizedBox(height: AppSpacing.xl),
              ClipRRect(
                borderRadius: BorderRadius.circular(AppRadii.lg),
                child: AspectRatio(
                  // Matches asset/splash_screen.png's native ratio so the
                  // full image (including the stat card baked into it)
                  // shows without cropping or distortion.
                  aspectRatio: 766 / 425,
                  child: Image.asset(
                    'asset/splash_screen.png',
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.push('/join'),
                  child: const Text('Get Started'),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => context.push('/login'),
                  child: const Text('Log In'),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}
