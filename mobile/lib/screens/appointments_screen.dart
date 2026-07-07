import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/appointment_models.dart';
import '../providers/appointment_provider.dart';
import '../theme/app_theme.dart';

Color _statusColor(String status) {
  switch (status) {
    case 'confirmed':
    case 'checked_in':
    case 'completed':
      return AppColors.secondary;
    case 'pending_payment':
      return AppColors.tertiary;
    case 'cancelled':
      return AppColors.error;
    default:
      return AppColors.outline;
  }
}

String _statusLabel(String status) =>
    status.split('_').map((w) => w[0].toUpperCase() + w.substring(1)).join(' ');

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AppointmentProvider>().loadAppointments();
    });
  }

  @override
  Widget build(BuildContext context) {
    final appointments = context.watch<AppointmentProvider>();
    final isEmpty = appointments.appointments.isEmpty;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('My Appointments'),
      ),
      body: SafeArea(
        child: appointments.isLoadingAppointments && isEmpty
            ? const Center(child: CircularProgressIndicator())
            : isEmpty
            ? Center(
                child: Text(
                  'No appointments yet.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              )
            : RefreshIndicator(
                onRefresh: () =>
                    context.read<AppointmentProvider>().loadAppointments(),
                child: ListView.builder(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  itemCount: appointments.appointments.length,
                  itemBuilder: (context, index) =>
                      _AppointmentTile(appointment: appointments.appointments[index]),
                ),
              ),
      ),
    );
  }
}

class _AppointmentTile extends StatelessWidget {
  const _AppointmentTile({required this.appointment});

  final Appointment appointment;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final naira = appointment.totalKobo / 100;
    final formattedTotal =
        '₦${naira.toStringAsFixed(2).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d)\.)'), (m) => '${m[1]},')}';
    final testNames = appointment.items.map((i) => i.name).join(', ');

    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    appointment.labName ?? 'TreatRyte Partner',
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: _statusColor(
                      appointment.status,
                    ).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(AppRadii.sm),
                  ),
                  child: Text(
                    _statusLabel(appointment.status),
                    style: textTheme.bodySmall?.copyWith(
                      color: _statusColor(appointment.status),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            if (testNames.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                testNames,
                style: textTheme.bodySmall,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            const SizedBox(height: AppSpacing.sm),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  [
                    appointment.scheduledDate,
                    appointment.scheduledTimeSlot,
                  ].where((s) => s != null && s.isNotEmpty).join(' · '),
                  style: textTheme.bodySmall?.copyWith(
                    color: AppColors.outline,
                  ),
                ),
                Text(
                  formattedTotal,
                  style: textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
