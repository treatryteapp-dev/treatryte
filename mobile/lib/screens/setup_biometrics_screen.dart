import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/vault_provider.dart';
import '../theme/app_theme.dart';

class SetupBiometricsScreen extends StatefulWidget {
  const SetupBiometricsScreen({super.key});

  @override
  State<SetupBiometricsScreen> createState() => _SetupBiometricsScreenState();
}

class _SetupBiometricsScreenState extends State<SetupBiometricsScreen> {
  bool _enabled = true;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Security Settings'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: AppSpacing.xl),
              Center(
                child: Container(
                  width: 140,
                  height: 140,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerLowest,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.outlineVariant),
                  ),
                  child: const Icon(Icons.fingerprint, size: 72, color: AppColors.primary),
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              Text(
                'Biometric Security',
                textAlign: TextAlign.center,
                style: textTheme.headlineMedium,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Add an extra layer of security to your medical records '
                'using your device native authentication.',
                textAlign: TextAlign.center,
                style: textTheme.bodyMedium,
              ),
              const SizedBox(height: AppSpacing.xl),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Row(
                    children: [
                      const Icon(Icons.shield_outlined, color: AppColors.secondary),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Enable Biometric Login',
                                style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                            Text('Unlock TreatRyte with your face or finger.',
                                style: textTheme.bodySmall),
                          ],
                        ),
                      ),
                      Switch(
                        value: _enabled,
                        onChanged: (value) => setState(() => _enabled = value),
                        activeThumbColor: AppColors.primary,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.info_outline, size: 16, color: AppColors.outline),
                  const SizedBox(width: AppSpacing.xs),
                  Expanded(
                    child: Text(
                      'Biometric data is stored securely on your device and is '
                      'never shared with TreatRyte servers.',
                      style: textTheme.bodySmall,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xl),
              ElevatedButton(
                onPressed: () async {
                  await context.read<VaultProvider>().setBiometricLock(_enabled);
                  if (context.mounted) context.go('/dashboard');
                },
                child: const Text('Setup FaceID/TouchID'),
              ),
              const SizedBox(height: AppSpacing.sm),
              TextButton(
                onPressed: () => context.go('/dashboard'),
                child: const Text('Maybe Later'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
