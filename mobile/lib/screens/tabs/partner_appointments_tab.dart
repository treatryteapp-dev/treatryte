import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class PartnerAppointmentsTab extends StatelessWidget {
  const PartnerAppointmentsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Appointments Scheduler', style: textTheme.headlineSmall),
            const SizedBox(height: 2),
            Text('Manage daily patient flow and medical consultations.', style: textTheme.bodySmall),
            const SizedBox(height: AppSpacing.lg),

            // Calendar Strip Mock
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(AppRadii.lg),
                border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.2)),
              ),
              child: Column(
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('October 2026', style: TextStyle(fontWeight: FontWeight.bold)),
                      Row(
                        children: [
                          Icon(Icons.chevron_left, size: 20),
                          SizedBox(width: AppSpacing.md),
                          Icon(Icons.chevron_right, size: 20),
                        ],
                      )
                    ],
                  ),
                  const Divider(height: AppSpacing.lg),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildCalDay('27', 'S'),
                      _buildCalDay('28', 'M'),
                      _buildCalDay('29', 'T', selected: true),
                      _buildCalDay('30', 'W'),
                      _buildCalDay('01', 'T'),
                      _buildCalDay('02', 'F'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // Filters
            Row(
              children: [
                _buildFilterChip('All (12)', selected: true),
                const SizedBox(width: AppSpacing.sm),
                _buildFilterChip('Confirmed (8)'),
                const SizedBox(width: AppSpacing.sm),
                _buildFilterChip('Pending (4)'),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),

            // Appointment list
            _buildAppointmentRow(
              context,
              time: '09:00',
              patient: 'Adewale Thompson',
              type: 'General Consultation',
              status: 'Confirmed',
              statusColor: AppColors.secondary,
            ),
            const Divider(),
            _buildAppointmentRow(
              context,
              time: '10:30',
              patient: 'Chinense Okere',
              type: 'Cardiology Follow-up',
              status: 'Pending',
              statusColor: AppColors.primary,
            ),
            const Divider(),
            _buildAppointmentRow(
              context,
              time: '11:45',
              patient: 'Fatima Yusuf',
              type: 'Lab Results Review',
              status: 'Confirmed',
              statusColor: AppColors.secondary,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCalDay(String day, String weekday, {bool selected = false}) {
    return Column(
      children: [
        Text(weekday, style: const TextStyle(fontSize: 11, color: AppColors.outline)),
        const SizedBox(height: 4),
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: selected ? AppColors.primary : Colors.transparent,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              day,
              style: TextStyle(
                color: selected ? Colors.white : AppColors.onBackground,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        )
      ],
    );
  }

  Widget _buildFilterChip(String label, {bool selected = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 6),
      decoration: BoxDecoration(
        color: selected ? AppColors.primary : AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(AppRadii.full),
        border: Border.all(color: selected ? AppColors.primary : AppColors.outlineVariant.withValues(alpha: 0.5)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: selected ? Colors.white : AppColors.onSurfaceVariant,
        ),
      ),
    );
  }

  Widget _buildAppointmentRow(
    BuildContext context, {
    required String time,
    required String patient,
    required String type,
    required String status,
    required Color statusColor,
  }) {
    final textTheme = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            time,
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
                Text(patient, style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(type, style: textTheme.bodySmall),
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
                      status,
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
          OutlinedButton(
            onPressed: () {},
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(80, 36),
              padding: const EdgeInsets.symmetric(horizontal: 12),
            ),
            child: const Text('Check In'),
          ),
        ],
      ),
    );
  }
}
