import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../providers/appointment_provider.dart';
import '../providers/wallet_provider.dart';
import '../theme/app_theme.dart';

class SelectedService {
  const SelectedService({required this.id, required this.name, required this.priceKobo});

  final String id;
  final String name;
  final int priceKobo;
}

class BookTestArgs {
  const BookTestArgs({
    required this.labId,
    required this.labName,
    required this.labAddress,
    required this.services,
  });

  final String labId;
  final String labName;
  final String labAddress;
  // One or more services booked together as a single appointment - one
  // slot, one service fee, one payment.
  final List<SelectedService> services;
}

class BookTestScreen extends StatefulWidget {
  const BookTestScreen({super.key, required this.booking});

  final BookTestArgs booking;

  @override
  State<BookTestScreen> createState() => _BookTestScreenState();
}

class _BookTestScreenState extends State<BookTestScreen> {
  int _selectedDay = 0;
  int _selectedTime = 0;
  bool _paying = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AppointmentProvider>().loadAvailability(widget.booking.labId);
      context.read<WalletProvider>().refresh();
    });
  }

  String _formatNaira(int kobo) => '₦${(kobo / 100).toStringAsFixed(kobo % 100 == 0 ? 0 : 2)}';

  Future<void> _payViaWallet() async {
    final appointments = context.read<AppointmentProvider>();
    if (appointments.availability.isEmpty) return;

    final day = appointments.availability[_selectedDay];
    final time = day.slots[_selectedTime];

    setState(() => _paying = true);
    final success = await appointments.bookAndPay(
      labId: widget.booking.labId,
      testIds: widget.booking.services.map((s) => s.id).toList(),
      scheduledDate: DateFormat('yyyy-MM-dd').format(day.date),
      scheduledTimeSlot: time.time,
    );
    if (!mounted) return;
    setState(() => _paying = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Appointment booked and paid successfully.')),
      );
      context.pop();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(appointments.errorMessage ?? 'Booking failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final appointments = context.watch<AppointmentProvider>();
    final wallet = context.watch<WalletProvider>();
    final services = widget.booking.services;
    final subtotal = services.fold<int>(0, (sum, s) => sum + s.priceKobo);
    final serviceFee = appointments.serviceFeeKobo;
    final total = subtotal + serviceFee;

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
                    Text(
                      services.length > 1 ? 'SELECTED SERVICES (${services.length})' : 'SELECTED SERVICE',
                      style: textTheme.labelSmall,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    for (final service in services)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 2),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                service.name,
                                style: services.length > 1
                                    ? textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)
                                    : textTheme.headlineSmall,
                              ),
                            ),
                            Text(_formatNaira(service.priceKobo), style: textTheme.bodyMedium),
                          ],
                        ),
                      ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 14, color: AppColors.outline),
                        Text(' ${widget.booking.labName}, ${widget.booking.labAddress}',
                            style: textTheme.bodySmall),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              Text('Schedule Appointment', style: textTheme.headlineSmall),
              const SizedBox(height: AppSpacing.md),
              if (appointments.isLoading && appointments.availability.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: AppSpacing.lg),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (appointments.availability.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        appointments.errorMessage ?? 'Could not load available appointment slots.',
                        style: textTheme.bodyMedium?.copyWith(color: AppColors.error),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      OutlinedButton(
                        onPressed: () => context.read<AppointmentProvider>().loadAvailability(widget.booking.labId),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              else ...[
                SizedBox(
                  height: 80,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: appointments.availability.length,
                    separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.sm),
                    itemBuilder: (context, index) {
                      final day = appointments.availability[index];
                      final selected = index == _selectedDay;
                      return GestureDetector(
                        onTap: () => setState(() {
                          _selectedDay = index;
                          _selectedTime = 0;
                        }),
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
                                DateFormat('EEE').format(day.date),
                                style: TextStyle(
                                  fontSize: 12,
                                  color: selected ? Colors.white70 : AppColors.onSurfaceVariant,
                                ),
                              ),
                              Text(
                                DateFormat('d').format(day.date),
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: selected ? Colors.white : AppColors.onSurface,
                                ),
                              ),
                              Text(
                                DateFormat('MMM').format(day.date).toUpperCase(),
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
                if (appointments.availability.isNotEmpty)
                  GridView.count(
                    crossAxisCount: 3,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: AppSpacing.sm,
                    crossAxisSpacing: AppSpacing.sm,
                    childAspectRatio: 2.4,
                    children: [
                      for (var i = 0; i < appointments.availability[_selectedDay].slots.length; i++)
                        Builder(builder: (context) {
                          final slot = appointments.availability[_selectedDay].slots[i];
                          final selected = i == _selectedTime;
                          return OutlinedButton(
                            onPressed: slot.available ? () => setState(() => _selectedTime = i) : null,
                            style: OutlinedButton.styleFrom(
                              backgroundColor: selected ? AppColors.primary : AppColors.surfaceContainerLowest,
                              foregroundColor: selected ? Colors.white : AppColors.onSurface,
                              disabledBackgroundColor: AppColors.surfaceContainerHigh,
                              side: BorderSide(
                                color: selected ? AppColors.primary : AppColors.outlineVariant,
                              ),
                            ),
                            child: Text(slot.time, style: const TextStyle(fontSize: 12)),
                          );
                        }),
                    ],
                  ),
              ],
              const SizedBox(height: AppSpacing.xl),
              Text('Payment Summary', style: textTheme.headlineSmall),
              const SizedBox(height: AppSpacing.sm),
              _SummaryRow(label: 'Subtotal', value: _formatNaira(subtotal)),
              // Subscribers pay zero service fee - showing a redundant "₦0"
              // line just raises questions, so omit it entirely for them.
              if (serviceFee > 0) _SummaryRow(label: 'Service Fee', value: _formatNaira(serviceFee)),
              const Divider(height: AppSpacing.lg),
              _SummaryRow(
                label: 'Total',
                value: _formatNaira(total),
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
                        'Wallet Balance: ${wallet.formattedBalance}',
                        style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                      ),
                    ),
                    TextButton(
                      onPressed: () => context.push('/fund-wallet'),
                      child: const Text('Top up'),
                    ),
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
                  onPressed: (_paying || appointments.availability.isEmpty) ? null : _payViaWallet,
                  child: _paying
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Row(
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
