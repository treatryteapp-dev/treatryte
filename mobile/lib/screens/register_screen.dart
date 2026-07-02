import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_theme.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _dobController = TextEditingController();
  String? _gender;
  bool _agreedToTerms = false;

  @override
  void dispose() {
    _dobController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      firstDate: DateTime(now.year - 100),
      lastDate: now,
      initialDate: DateTime(now.year - 25),
    );
    if (picked != null) {
      _dobController.text =
          '${picked.day.toString().padLeft(2, '0')}/${picked.month.toString().padLeft(2, '0')}/${picked.year}';
    }
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('TreatRyte'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Individual Registration', style: textTheme.headlineMedium),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Please provide valid information as it appears on your '
                'legal documents.',
                style: textTheme.bodyMedium,
              ),
              const SizedBox(height: AppSpacing.xl),
              _FieldLabel('FULL LEGAL NAME'),
              const TextField(
                decoration: InputDecoration(hintText: 'John Olusegun Doe'),
              ),
              const SizedBox(height: AppSpacing.md),
              _FieldLabel('DATE OF BIRTH'),
              TextField(
                controller: _dobController,
                readOnly: true,
                onTap: _pickDate,
                decoration: const InputDecoration(
                  hintText: 'dd/mm/yyyy',
                  suffixIcon: Icon(Icons.calendar_today_outlined, size: 20),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              _FieldLabel('GENDER'),
              DropdownButtonFormField<String>(
                initialValue: _gender,
                decoration: const InputDecoration(hintText: 'Select Gender'),
                items: const [
                  DropdownMenuItem(value: 'female', child: Text('Female')),
                  DropdownMenuItem(value: 'male', child: Text('Male')),
                  DropdownMenuItem(
                    value: 'prefer_not_to_say',
                    child: Text('Prefer not to say'),
                  ),
                ],
                onChanged: (value) => setState(() => _gender = value),
              ),
              const SizedBox(height: AppSpacing.md),
              _FieldLabel('RESIDENTIAL ADDRESS'),
              const TextField(
                decoration: InputDecoration(
                  hintText: '123 Admiralty Way, Lekki Phase 1, Lagos State',
                  prefixIcon: Icon(Icons.location_on_outlined),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  _FieldLabel('VERIFICATION ID (BVN/NIN)'),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.secondaryContainer,
                      borderRadius: BorderRadius.circular(AppRadii.full),
                    ),
                    child: Text(
                      'REQUIRED',
                      style: textTheme.labelSmall?.copyWith(
                        color: AppColors.onSecondaryContainer,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              const TextField(
                keyboardType: TextInputType.number,
                decoration: InputDecoration(hintText: '22334455667'),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                'Our +565438 on your registered mobile to get your PIN.',
                style: textTheme.bodySmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Checkbox(
                    value: _agreedToTerms,
                    activeColor: AppColors.primary,
                    onChanged: (value) {
                      setState(() => _agreedToTerms = value ?? false);
                    },
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: Text.rich(
                        TextSpan(
                          style: textTheme.bodySmall,
                          children: const [
                            TextSpan(
                              text: 'I certify that all provided information '
                                  'is accurate and I agree to the ',
                            ),
                            TextSpan(
                              text: 'Terms of Service',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            TextSpan(text: ' and '),
                            TextSpan(
                              text: 'Privacy Policy',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            TextSpan(text: '.'),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _agreedToTerms
                      ? () => context.push('/setup-biometrics')
                      : null,
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Sign Up'),
                      SizedBox(width: AppSpacing.sm),
                      Icon(Icons.arrow_forward, size: 18),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              const Center(
                child: Text(
                  '© 2024 TreatRyte Technologies. All rights reserved.',
                  style: TextStyle(fontSize: 11, color: AppColors.outline),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Text(label, style: Theme.of(context).textTheme.labelSmall),
    );
  }
}
