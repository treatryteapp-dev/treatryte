import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/appointment_models.dart';
import '../../providers/partner_provider.dart';
import '../../theme/app_theme.dart';

class PartnerAppointmentsTab extends StatefulWidget {
  const PartnerAppointmentsTab({super.key});

  @override
  State<PartnerAppointmentsTab> createState() => _PartnerAppointmentsTabState();
}

class _PartnerAppointmentsTabState extends State<PartnerAppointmentsTab> {
  bool _loaded = false;
  String _activeFilter = 'All';

  static const _statusLabels = {
    'pending_payment': 'Pending',
    'confirmed': 'Confirmed',
    'checked_in': 'Checked In',
    'cancelled': 'Cancelled',
  };

  List<Appointment> _filtered(List<Appointment> all) {
    if (_activeFilter == 'All') return all;
    return all.where((a) => _statusLabels[a.status] == _activeFilter).toList();
  }

  void _showActionSheet(Appointment apt) {
    final partner = context.read<PartnerProvider>();
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: AppColors.surfaceContainerLowest,
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadii.xl)),
        ),
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg, AppSpacing.md, AppSpacing.lg, AppSpacing.xl,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                  color: AppColors.outlineVariant,
                  borderRadius: BorderRadius.circular(AppRadii.full),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              apt.patientName ?? 'Patient',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            Text(
              '${apt.serviceType ?? 'Appointment'}  •  ${apt.scheduledTimeSlot ?? ''}',
              style: const TextStyle(color: AppColors.onSurfaceVariant, fontSize: 13),
            ),
            const SizedBox(height: AppSpacing.lg),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    icon: const Icon(Icons.login, size: 18),
                    label: const Text('Check In'),
                    onPressed: () async {
                      Navigator.of(ctx).pop();
                      final ok = await partner.checkIn(apt.id);
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(ok ? '${apt.patientName ?? 'Patient'} checked in.' : 'Failed to check in.')),
                      );
                    },
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.edit_calendar_outlined, size: 18),
                    label: const Text('Reschedule'),
                    onPressed: () {
                      Navigator.of(ctx).pop();
                      _showRescheduleDialog(apt);
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            SizedBox(
              width: double.infinity,
              child: TextButton.icon(
                icon: const Icon(Icons.cancel_outlined, size: 18, color: AppColors.error),
                label: const Text(
                  'Cancel Appointment',
                  style: TextStyle(color: AppColors.error),
                ),
                onPressed: () async {
                  Navigator.of(ctx).pop();
                  final ok = await partner.cancelAppointment(apt.id);
                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(ok ? '${apt.patientName ?? 'Appointment'} cancelled.' : 'Failed to cancel.')),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showRescheduleDialog(Appointment apt) async {
    final dateController = TextEditingController(text: apt.scheduledDate ?? '');
    final slotController = TextEditingController(text: apt.scheduledTimeSlot ?? '');
    final partner = context.read<PartnerProvider>();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Reschedule Appointment'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: dateController,
              decoration: const InputDecoration(labelText: 'Date (YYYY-MM-DD)'),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: slotController,
              decoration: const InputDecoration(labelText: 'Time Slot'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(dialogContext).pop(false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.of(dialogContext).pop(true), child: const Text('Save')),
        ],
      ),
    );

    if (confirmed != true) return;
    final ok = await partner.reschedule(
      apt.id,
      scheduledDate: dateController.text.trim(),
      scheduledTimeSlot: slotController.text.trim(),
    );
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(ok ? 'Appointment rescheduled.' : 'Failed to reschedule.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_loaded) {
      _loaded = true;
      final provider = context.read<PartnerProvider>();
      Future.microtask(() => provider.loadAppointments());
    }

    final textTheme = Theme.of(context).textTheme;
    final partner = context.watch<PartnerProvider>();
    final all = partner.appointments;
    final filtered = _filtered(all);
    final confirmed = all.where((a) => a.status == 'confirmed').length;
    final pending = all.where((a) => a.status == 'pending_payment').length;

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => context.read<PartnerProvider>().loadAppointments(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Appointments Scheduler', style: textTheme.headlineSmall),
              const SizedBox(height: 2),
              Text(
                'Manage daily patient flow and medical consultations.',
                style: textTheme.bodySmall,
              ),
              const SizedBox(height: AppSpacing.lg),

              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterChip('All (${all.length})', 'All'),
                    const SizedBox(width: AppSpacing.sm),
                    _buildFilterChip('Confirmed ($confirmed)', 'Confirmed'),
                    const SizedBox(width: AppSpacing.sm),
                    _buildFilterChip('Pending ($pending)', 'Pending'),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              if (partner.isLoadingAppointments && all.isEmpty)
                const Center(
                  child: Padding(padding: EdgeInsets.all(AppSpacing.xl), child: CircularProgressIndicator()),
                )
              else if (partner.appointmentsError != null)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.xl),
                  child: Text(partner.appointmentsError!, style: textTheme.bodySmall?.copyWith(color: AppColors.error)),
                )
              else if (filtered.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.xl),
                    child: Text(
                      'No $_activeFilter appointments.',
                      style: textTheme.bodySmall,
                    ),
                  ),
                )
              else
                Card(
                  child: Column(
                    children: [
                      for (int i = 0; i < filtered.length; i++) ...[
                        if (i > 0) const Divider(height: 1, indent: 16, endIndent: 16),
                        _buildAppointmentRow(filtered[i]),
                      ],
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _activeFilter == value;
    return GestureDetector(
      onTap: () => setState(() => _activeFilter = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(AppRadii.full),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : AppColors.outlineVariant.withValues(alpha: 0.5),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : AppColors.onSurfaceVariant,
          ),
        ),
      ),
    );
  }

  Widget _buildAppointmentRow(Appointment apt) {
    final textTheme = Theme.of(context).textTheme;
    final isConfirmed = apt.status == 'confirmed' || apt.status == 'checked_in';
    final statusColor = isConfirmed ? AppColors.secondary : AppColors.primary;
    final statusLabel = _statusLabels[apt.status] ?? apt.status;

    return InkWell(
      onTap: () => _showActionSheet(apt),
      borderRadius: BorderRadius.circular(AppRadii.md),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.md,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              apt.scheduledTimeSlot ?? '--',
              style: textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(width: AppSpacing.lg),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    apt.patientName ?? 'Patient',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(apt.serviceType ?? 'Appointment', style: textTheme.bodySmall),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: statusColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        statusLabel,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: statusColor,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right,
              color: AppColors.outline,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
