import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_theme.dart';

enum _Role { user, partner }

class JoinScreen extends StatefulWidget {
  const JoinScreen({super.key});

  @override
  State<JoinScreen> createState() => _JoinScreenState();
}

class _JoinScreenState extends State<JoinScreen> {
  _Role? _selectedRole;

  void _continue() {
    if (_selectedRole == _Role.user) {
      context.push('/register');
    } else if (_selectedRole == _Role.partner) {
      context.push('/partner-register');
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
              Text.rich(
                TextSpan(
                  style: textTheme.displaySmall,
                  children: const [
                    TextSpan(text: 'Your gateway to '),
                    TextSpan(
                      text: 'seamless care.',
                      style: TextStyle(color: AppColors.primary),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'A secure, transparent bridge connecting smart personal '
                'health tracking with local diagnostic providers.',
                style: textTheme.bodyMedium,
              ),
              const SizedBox(height: AppSpacing.xl),
              _RoleCard(
                icon: Icons.person_outline,
                title: 'Become a User',
                description:
                    'Set free medication alarms, search transparent clinic '
                    'prices, and securely own your medical records.',
                selected: _selectedRole == _Role.user,
                onTap: () => setState(() => _selectedRole = _Role.user),
              ),
              const SizedBox(height: AppSpacing.md),
              _RoleCard(
                icon: Icons.local_hospital_outlined,
                title: 'Become a Partner',
                description:
                    'Publish your clinical storefront, issue digital '
                    'records automatically, and manage patient billing.',
                selected: _selectedRole == _Role.partner,
                onTap: () => setState(() => _selectedRole = _Role.partner),
              ),
              const SizedBox(height: AppSpacing.xl),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _selectedRole == null ? null : _continue,
                  child: const Text('Continue Registration'),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Center(
                child: TextButton(
                  onPressed: () => context.push('/login'),
                  child: const Text('Already have an account? Log in'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  const _RoleCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String description;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadii.lg),
        side: BorderSide(
          color: selected ? AppColors.primary : Colors.transparent,
          width: 2,
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadii.lg),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.secondaryContainer,
                  borderRadius: BorderRadius.circular(AppRadii.md),
                ),
                child: Icon(icon, color: AppColors.onSecondaryContainer),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: textTheme.headlineSmall),
                    const SizedBox(height: 2),
                    Text(description, style: textTheme.bodySmall),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Icon(
                selected ? Icons.check_circle : Icons.radio_button_unchecked,
                color: selected ? AppColors.primary : AppColors.outline,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
