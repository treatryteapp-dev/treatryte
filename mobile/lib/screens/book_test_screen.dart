import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_theme.dart';

class BookTestScreen extends StatefulWidget {
  const BookTestScreen({super.key});

  @override
  State<BookTestScreen> createState() => _BookTestScreenState();
}

class _BookTestScreenState extends State<BookTestScreen> {
  int _selectedDay = 0;
  int _selectedTime = 2;

  static const _days = [
    (label: 'Mon', date: '24', month: 'MAY'),
    (label: 'Tue', date: '25', month: 'MAY'),
    (label: 'Wed', date: '26', month: 'MAY'),
    (label: 'Thu', date: '27', month: 'MAY'),
  ];

  static const _times = [
    '09:00 AM',
    '10:30 AM',
    '11:00 AM',
    '01:30 PM',
    '03:00 PM',
    '04:30 PM',
  ];

  static const _subtotal = 7500;
  static const _serviceFee = 1000;
  static const _walletBalance = 45000;

  int get _total => _subtotal + _serviceFee;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Book Test'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(AppRadii.lg),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('SELECTED SERVICE', style: textTheme.labelSmall),
                    const SizedBox(height: AppSpacing.xs),
                    Text('Full Blood Count', style: textTheme.headlineSmall),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 14, color: AppColors.outline),
                        Text(' Care Diagnostics, Victoria Island', style: textTheme.bodySmall),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              Text('Schedule Appointment', style: textTheme.headlineSmall),
              const SizedBox(height: AppSpacing.md),
              SizedBox(
                height: 80,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _days.length,
                  separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.sm),
                  itemBuilder: (context, index) {
                    final day = _days[index];
                    final selected = index == _selectedDay;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedDay = index),
                      child: Container(
                        width: 64,
                        decoration: BoxDecoration(
                          color: selected ? AppColors.primary : AppColors.surfaceContainerLowest,
                          borderRadius: BorderRadius.circular(AppRadii.md),
                          border: Border.all(
                            color: selected ? AppColors.primary : AppColors.outlineVariant,
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              day.label,
                              style: TextStyle(
                                fontSize: 12,
                                color: selected ? Colors.white70 : AppColors.onSurfaceVariant,
                              ),
                            ),
                            Text(
                              day.date,
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: selected ? Colors.white : AppColors.onSurface,
                              ),
                            ),
                            Text(
                              day.month,
                              style: TextStyle(
                                fontSize: 10,
                                color: selected ? Colors.white70 : AppColors.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              GridView.count(
                crossAxisCount: 3,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: AppSpacing.sm,
                crossAxisSpacing: AppSpacing.sm,
                childAspectRatio: 2.4,
                children: [
                  for (var i = 0; i < _times.length; i++)
                    OutlinedButton(
                      onPressed: () => setState(() => _selectedTime = i),
                      style: OutlinedButton.styleFrom(
                        backgroundColor: i == _selectedTime
                            ? AppColors.primary
                            : AppColors.surfaceContainerLowest,
                        foregroundColor: i == _selectedTime ? Colors.white : AppColors.onSurface,
                        side: BorderSide(
                          color: i == _selectedTime ? AppColors.primary : AppColors.outlineVariant,
                        ),
                      ),
                      child: Text(_times[i], style: const TextStyle(fontSize: 12)),
                    ),
                ],
              ),
              const SizedBox(height: AppSpacing.xl),
              Text('Payment Summary', style: textTheme.headlineSmall),
              const SizedBox(height: AppSpacing.sm),
              const _SummaryRow(label: 'Subtotal', value: '₦$_subtotal'),
              const _SummaryRow(label: 'Service Fee', value: '₦$_serviceFee'),
              const Divider(height: AppSpacing.lg),
              _SummaryRow(
                label: 'Total',
                value: '₦$_total',
                emphasize: true,
              ),
              const SizedBox(height: AppSpacing.lg),
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.secondaryContainer.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(AppRadii.lg),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.account_balance_wallet, color: AppColors.secondary),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text(
                        'Wallet Balance: ₦$_walletBalance.00',
                        style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                      ),
                    ),
                    TextButton(onPressed: () {}, child: const Text('Top up')),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.lock_outline, size: 16, color: AppColors.outline),
                  const SizedBox(width: AppSpacing.xs),
                  Expanded(
                    child: Text(
                      'Your payment and medical data are protected with bank-grade '
                      '256-bit encryption. Your results will be sent directly to your Vault.',
                      style: textTheme.bodySmall,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.pop(),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Pay via Wallet'),
                      SizedBox(width: AppSpacing.sm),
                      Icon(Icons.arrow_forward, size: 18),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Center(
                child: Text(
                  'By tapping Pay, you agree to our Terms of Service',
                  style: textTheme.bodySmall,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    this.emphasize = false,
  });

  final String label;
  final String value;
  final bool emphasize;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final style = emphasize
        ? textTheme.headlineSmall
        : textTheme.bodyMedium;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: style),
          Text(value, style: style?.copyWith(
            color: emphasize ? AppColors.primary : null,
          )),
        ],
      ),
    );
  }
}
