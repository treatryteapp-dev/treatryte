import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class PartnerRegisterScreen extends StatefulWidget {
  const PartnerRegisterScreen({super.key});

  @override
  State<PartnerRegisterScreen> createState() => _PartnerRegisterScreenState();
}

class _PartnerRegisterScreenState extends State<PartnerRegisterScreen> {
  int _currentStep = 0; // 0: Facility Info, 1: Certificate Upload, 2: Credential Audit, 3: Submission Success

  // Form controllers for Step 1
  final _formKey = GlobalKey<FormState>();
  final _facilityNameController = TextEditingController();
  final _licenseController = TextEditingController();
  final _contactController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _addressController = TextEditingController();
  final _stateController = TextEditingController(text: 'Lagos State');

  // Selected Services
  final Set<String> _selectedServices = {'General Practice'};
  final List<String> _availableServices = [
    'General Practice',
    'Diagnostics',
    'Maternity Care',
    'Pharmacy',
    'Surgical Center'
  ];

  // Uploaded Files mock state
  final List<Map<String, dynamic>> _uploadedFiles = [
    {
      'name': 'State_Medical_License_2024.pdf',
      'size': '2.4 MB',
      'status': 'verified',
      'progress': 1.0
    }
  ];
  bool _isUploadingMockFile = false;
  double _mockUploadProgress = 0.0;

  // Step 3 Confirmation
  bool _attested = false;

  @override
  void dispose() {
    _facilityNameController.dispose();
    _licenseController.dispose();
    _contactController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _addressController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  void _addMockFile() {
    if (_isUploadingMockFile) return;
    setState(() {
      _isUploadingMockFile = true;
      _mockUploadProgress = 0.0;
    });

    Timer.periodic(const Duration(milliseconds: 150), (timer) {
      setState(() {
        _mockUploadProgress += 0.15;
        if (_mockUploadProgress >= 1.0) {
          _mockUploadProgress = 1.0;
          _isUploadingMockFile = false;
          _uploadedFiles.add({
            'name': 'Board_Certification_Scan.jpg',
            'size': '1.8 MB',
            'status': 'uploaded',
            'progress': 1.0
          });
          timer.cancel();
        }
      });
    });
  }

  Future<void> _submit() async {
    if (!_attested) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please check the attestation checkbox.')),
      );
      return;
    }

    final auth = context.read<AuthProvider>();
    final success = await auth.register(
      fullName: _facilityNameController.text.trim(),
      // Send dummy date and gender to pass backend registration validation
      dateOfBirth: '2000-01-01',
      gender: 'prefer_not_to_say',
      address: '${_addressController.text.trim()}, ${_stateController.text.trim()}',
      email: _emailController.text.trim(),
      password: _passwordController.text,
      role: 'provider',
    );

    if (!mounted) return;
    if (success) {
      setState(() {
        _currentStep = 3; // Go to success screen
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.errorMessage ?? 'Registration failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_currentStep == 3) {
      return _buildSuccessScreen(context);
    }

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
        title: const Text('REGISTRATION FLOW'),
        centerTitle: true,
        actions: const [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: AppSpacing.md),
            child: Center(
              child: Text(
                'PARTNER PORTAL',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1,
                  color: AppColors.primary,
                ),
              ),
            ),
          )
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            _buildStepIndicator(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: _buildCurrentStepView(),
              ),
            ),
            _buildFooterActions(),
          ],
        ),
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        border: Border(
          bottom: BorderSide(
            color: AppColors.onBackground.withValues(alpha: 0.05),
          ),
        ),
      ),
      child: Row(
        children: [
          _StepIcon(step: 1, active: _currentStep >= 0, completed: _currentStep > 0),
          const Expanded(child: Divider(indent: 8, endIndent: 8)),
          _StepIcon(step: 2, active: _currentStep >= 1, completed: _currentStep > 1),
          const Expanded(child: Divider(indent: 8, endIndent: 8)),
          _StepIcon(step: 3, active: _currentStep >= 2, completed: false),
        ],
      ),
    );
  }

  Widget _buildCurrentStepView() {
    switch (_currentStep) {
      case 0:
        return _buildFacilityInfoForm();
      case 1:
        return _buildCertificateUploadView();
      case 2:
        return _buildCredentialAuditView();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildFacilityInfoForm() {
    final textTheme = Theme.of(context).textTheme;
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.verified_user, color: AppColors.secondary, size: 20),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'KYC VERIFICATION REQUIRED',
                style: textTheme.labelSmall?.copyWith(
                  color: AppColors.secondary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text('Partner Center Registration', style: textTheme.headlineMedium),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Complete your professional profile to join Nigeria\'s most trusted healthcare and financial network. Your data is encrypted and handled with clinical precision.',
            style: textTheme.bodySmall,
          ),
          const SizedBox(height: AppSpacing.xl),
          Row(
            children: [
              const Icon(Icons.apartment, color: AppColors.primary, size: 20),
              const SizedBox(width: AppSpacing.sm),
              Text('FACILITY IDENTIFICATION', style: textTheme.labelMedium),
            ],
          ),
          const Divider(height: AppSpacing.lg),
          const SizedBox(height: AppSpacing.sm),
          _FieldLabel('FACILITY NAME'),
          TextFormField(
            controller: _facilityNameController,
            decoration: const InputDecoration(hintText: 'e.g. Lagos City Specialist Hospital'),
            validator: (value) => (value == null || value.trim().isEmpty) ? 'Required' : null,
          ),
          const SizedBox(height: AppSpacing.md),
          _FieldLabel('MEDICAL LICENSE NUMBER'),
          TextFormField(
            controller: _licenseController,
            decoration: const InputDecoration(
              hintText: 'MDCN/REG/00000',
              suffixIcon: Icon(Icons.info_outline, size: 20),
            ),
            validator: (value) => (value == null || value.trim().isEmpty) ? 'Required' : null,
          ),
          const SizedBox(height: AppSpacing.md),
          _FieldLabel('CONTACT PERSON (ADMINISTRATOR)'),
          TextFormField(
            controller: _contactController,
            decoration: const InputDecoration(hintText: 'Full legal name'),
            validator: (value) => (value == null || value.trim().isEmpty) ? 'Required' : null,
          ),
          const SizedBox(height: AppSpacing.md),
          _FieldLabel('EMAIL ADDRESS'),
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(hintText: 'e.g. admin@hospital.com'),
            validator: (value) => (value == null || !value.contains('@')) ? 'Enter a valid email' : null,
          ),
          const SizedBox(height: AppSpacing.md),
          _FieldLabel('PASSWORD'),
          TextFormField(
            controller: _passwordController,
            obscureText: true,
            decoration: const InputDecoration(hintText: '••••••••'),
            validator: (value) => (value == null || value.length < 8) ? 'Min 8 characters' : null,
          ),
          const SizedBox(height: AppSpacing.md),
          _FieldLabel('CONFIRM PASSWORD'),
          TextFormField(
            controller: _confirmPasswordController,
            obscureText: true,
            decoration: const InputDecoration(hintText: '••••••••'),
            validator: (value) {
              if (value != _passwordController.text) return 'Passwords do not match';
              return null;
            },
          ),
          const SizedBox(height: AppSpacing.xl),
          Row(
            children: [
              const Icon(Icons.location_on, color: AppColors.primary, size: 20),
              const SizedBox(width: AppSpacing.sm),
              Text('PHYSICAL ADDRESS', style: textTheme.labelMedium),
            ],
          ),
          const Divider(height: AppSpacing.lg),
          const SizedBox(height: AppSpacing.sm),
          _FieldLabel('FULL STREET ADDRESS'),
          TextFormField(
            controller: _addressController,
            maxLines: 2,
            decoration: const InputDecoration(hintText: 'Number, Street, Area, LGA...'),
            validator: (value) => (value == null || value.trim().isEmpty) ? 'Required' : null,
          ),
          const SizedBox(height: AppSpacing.md),
          _FieldLabel('STATE'),
          TextFormField(
            controller: _stateController,
            decoration: const InputDecoration(hintText: 'Lagos State'),
            validator: (value) => (value == null || value.trim().isEmpty) ? 'Required' : null,
          ),
          const SizedBox(height: AppSpacing.xl),
          Row(
            children: [
              const Icon(Icons.medical_services, color: AppColors.primary, size: 20),
              const SizedBox(width: AppSpacing.sm),
              Text('SERVICES OFFERED', style: textTheme.labelMedium),
            ],
          ),
          const Divider(height: AppSpacing.lg),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.xs,
            children: _availableServices.map((service) {
              final isSelected = _selectedServices.contains(service);
              return FilterChip(
                label: Text(service),
                selected: isSelected,
                selectedColor: AppColors.primaryContainer.withValues(alpha: 0.2),
                checkmarkColor: AppColors.primary,
                labelStyle: TextStyle(
                  color: isSelected ? AppColors.primary : AppColors.onSurfaceVariant,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadii.md),
                  side: BorderSide(
                    color: isSelected ? AppColors.primary : AppColors.outlineVariant,
                  ),
                ),
                onSelected: (selected) {
                  setState(() {
                    if (selected) {
                      _selectedServices.add(service);
                    } else {
                      if (_selectedServices.length > 1) {
                        _selectedServices.remove(service);
                      }
                    }
                  });
                },
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildCertificateUploadView() {
    final textTheme = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Certificate Upload', style: textTheme.headlineMedium),
        const SizedBox(height: AppSpacing.xs),
        Text(
          'To ensure platform integrity and clinical compliance, please upload clear scans of your current medical licenses and relevant board certifications.',
          style: textTheme.bodyMedium,
        ),
        const SizedBox(height: AppSpacing.xl),
        GestureDetector(
          onTap: _addMockFile,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.xxl, horizontal: AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLowest,
              borderRadius: BorderRadius.circular(AppRadii.lg),
              border: Border.all(
                color: AppColors.outlineVariant,
                style: BorderStyle.solid,
                width: 1,
              ),
            ),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.cloud_upload_outlined, size: 36, color: AppColors.primary),
                ),
                const SizedBox(height: AppSpacing.md),
                Text('Click to browse or drag files here', style: textTheme.headlineSmall?.copyWith(fontSize: 16)),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  'Maximum file size 15MB. Supported formats: PDF, JPG, PNG.',
                  style: textTheme.bodySmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.lg),
                OutlinedButton(
                  onPressed: _addMockFile,
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(180, 44),
                  ),
                  child: const Text('Select Documents'),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        Text(
          'UPLOADED CREDENTIALS',
          style: textTheme.labelSmall?.copyWith(fontWeight: FontWeight.bold, letterSpacing: 0.5),
        ),
        const Divider(height: AppSpacing.md),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _uploadedFiles.length + (_isUploadingMockFile ? 1 : 0),
          separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.sm),
          itemBuilder: (context, index) {
            if (index == _uploadedFiles.length && _isUploadingMockFile) {
              return _buildUploadProgressTile();
            }
            final file = _uploadedFiles[index];
            final isVerified = file['status'] == 'verified';

            return Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(AppRadii.md),
                border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.5)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainer,
                      borderRadius: BorderRadius.circular(AppRadii.sm),
                    ),
                    child: Icon(
                      file['name'].endsWith('.pdf') ? Icons.description : Icons.image,
                      color: AppColors.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          file['name'],
                          style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            Text(file['size'], style: textTheme.bodySmall),
                            const SizedBox(width: AppSpacing.sm),
                            if (isVerified)
                              Row(
                                children: [
                                  const Icon(Icons.check_circle, size: 14, color: AppColors.secondary),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Verified',
                                    style: textTheme.labelSmall?.copyWith(color: AppColors.secondary),
                                  ),
                                ],
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, color: AppColors.error),
                    onPressed: () {
                      setState(() {
                        _uploadedFiles.removeAt(index);
                      });
                    },
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildUploadProgressTile() {
    final textTheme = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(AppRadii.md),
        border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.5)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainer,
                  borderRadius: BorderRadius.circular(AppRadii.sm),
                ),
                child: const Icon(Icons.image, color: AppColors.onSurfaceVariant),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Board_Certification_Scan.jpg',
                      style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text('Uploading ${(_mockUploadProgress * 100).toInt()}%...', style: textTheme.bodySmall),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          LinearProgressIndicator(
            value: _mockUploadProgress,
            backgroundColor: AppColors.surfaceContainer,
            color: AppColors.primary,
            minHeight: 4,
            borderRadius: BorderRadius.circular(2),
          ),
        ],
      ),
    );
  }

  Widget _buildCredentialAuditView() {
    final textTheme = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Credential Audit', style: textTheme.headlineMedium),
        const SizedBox(height: AppSpacing.xs),
        Text(
          'Please review your provided facility and medical credentials before final submission. Ensuring accuracy prevents delays in verification.',
          style: textTheme.bodyMedium,
        ),
        const SizedBox(height: AppSpacing.xl),
        _buildAuditCard(
          title: 'Facility Info',
          icon: Icons.local_hospital,
          children: [
            _buildAuditField('Registered Name', _facilityNameController.text),
            _buildAuditField('License Number', _licenseController.text),
            _buildAuditField('Primary Contact', _contactController.text),
            _buildAuditField('Email Address', _emailController.text),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        _buildAuditCard(
          title: 'Location',
          icon: Icons.pin_drop,
          children: [
            _buildAuditField('Physical Address', '${_addressController.text}, ${_stateController.text}'),
            const SizedBox(height: AppSpacing.sm),
            Container(
              height: 100,
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppRadii.md),
                color: AppColors.surfaceContainer,
                image: const DecorationImage(
                  image: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuChDVWw8NZsyJ2XqiITeQO_ioFk7p_oqsgzgU7K2yWkN-HRaf-5y36OWG58Ihp2acoBMifvQt6X20ES1QFkzD0NVJnJdB_o4sxIavb1_pU_ufsVzD3raiZmTrUBO3_CgTffQhsog3nDlH6frseJiEUj1D4cJX1Op1AMuHG-xFDjSLeij0wPNaB_2KqiH_ZIdTb16x-VIMo4xCToZevZwIEleUSHSLK48sPgWd-409kW-avIS__POv3GbGlZwwC0NS-mXiY6xILMiHU'),
                  fit: BoxFit.cover,
                  opacity: 0.6,
                ),
              ),
              child: const Center(
                child: Icon(Icons.location_on, color: AppColors.error, size: 36),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        _buildAuditCard(
          title: 'Services & Specialties',
          icon: Icons.medical_services,
          children: [
            Wrap(
              spacing: 6,
              children: _selectedServices
                  .map((service) => Chip(
                        label: Text(service),
                        visualDensity: VisualDensity.compact,
                        backgroundColor: AppColors.primaryContainer.withValues(alpha: 0.1),
                        side: BorderSide.none,
                        labelStyle: const TextStyle(fontSize: 12, color: AppColors.primary),
                      ))
                  .toList(),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        _buildAuditCard(
          title: 'Settlement Account',
          icon: Icons.account_balance,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  decoration: const BoxDecoration(
                    color: AppColors.surfaceContainer,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.account_balance_wallet_outlined, color: AppColors.outline),
                ),
                const SizedBox(width: AppSpacing.md),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('GTBank Plc', style: TextStyle(fontWeight: FontWeight.bold)),
                    Text('0123456789 • Apex Medical Center', style: TextStyle(color: AppColors.outline, fontSize: 13)),
                  ],
                ),
              ],
            )
          ],
        ),
        const SizedBox(height: AppSpacing.xl),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Checkbox(
              value: _attested,
              activeColor: AppColors.primary,
              onChanged: (value) => setState(() => _attested = value ?? false),
            ),
            const Expanded(
              child: Padding(
                padding: EdgeInsets.only(top: 10.0),
                child: Text(
                  'I attest that the information provided is accurate and verifiable. I understand that false information may lead to rejection.',
                  style: TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildAuditCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(icon, color: AppColors.primary, size: 20),
                    const SizedBox(width: AppSpacing.sm),
                    Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                TextButton(
                  onPressed: () => setState(() => _currentStep = 0),
                  child: const Text('Edit'),
                ),
              ],
            ),
            const Divider(),
            const SizedBox(height: AppSpacing.sm),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildAuditField(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppColors.outline, fontSize: 11)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15)),
        ],
      ),
    );
  }

  Widget _buildFooterActions() {
    final auth = context.watch<AuthProvider>();
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -4),
          )
        ],
      ),
      child: Row(
        children: [
          if (_currentStep > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: () {
                  setState(() {
                    _currentStep--;
                  });
                },
                child: const Text('Back'),
              ),
            ),
          if (_currentStep > 0) const SizedBox(width: AppSpacing.md),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: auth.isLoading
                  ? null
                  : () {
                      if (_currentStep == 0) {
                        if (_formKey.currentState?.validate() ?? false) {
                          setState(() => _currentStep = 1);
                        }
                      } else if (_currentStep == 1) {
                        setState(() => _currentStep = 2);
                      } else if (_currentStep == 2) {
                        _submit();
                      }
                    },
              child: auth.isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(_currentStep == 2 ? 'Submit Registration' : 'Next Step'),
                        const SizedBox(width: AppSpacing.xs),
                        const Icon(Icons.arrow_forward, size: 18),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessScreen(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: AppColors.secondaryContainer.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                  ),
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: AppColors.secondaryContainer,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.onSecondaryContainer.withValues(alpha: 0.2),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        )
                      ],
                    ),
                    child: const Icon(
                      Icons.check_circle,
                      color: AppColors.onSecondaryContainer,
                      size: 40,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xl),
              Text('Application Submitted!', style: textTheme.headlineMedium, textAlign: TextAlign.center),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Your credentials have been securely transmitted to our clinical review team. Please allow 24 to 48 hours for the verification process to complete.',
                style: textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              const Divider(),
              const SizedBox(height: AppSpacing.md),
              ElevatedButton(
                onPressed: () async {
                  await context.read<AuthProvider>().logout();
                  if (context.mounted) {
                    context.go('/login');
                  }
                },
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Return to Login'),
                    SizedBox(width: AppSpacing.sm),
                    Icon(Icons.arrow_forward, size: 18),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StepIcon extends StatelessWidget {
  const _StepIcon({required this.step, required this.active, required this.completed});

  final int step;
  final bool active;
  final bool completed;

  @override
  Widget build(BuildContext context) {
    if (completed) {
      return Container(
        width: 32,
        height: 32,
        decoration: const BoxDecoration(
          color: AppColors.primary,
          shape: BoxShape.circle,
        ),
        child: const Icon(Icons.check, size: 16, color: Colors.white),
      );
    }

    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: active ? AppColors.primary : AppColors.surfaceContainerHighest,
        shape: BoxShape.circle,
        border: active ? null : Border.all(color: AppColors.outlineVariant),
      ),
      child: Center(
        child: Text(
          '$step',
          style: TextStyle(
            color: active ? Colors.white : AppColors.outline,
            fontWeight: FontWeight.bold,
            fontSize: 13,
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
