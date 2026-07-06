import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class PartnerAppointmentsTab extends StatefulWidget {
  const PartnerAppointmentsTab({super.key});

  @override
  State<PartnerAppointmentsTab> createState() => _PartnerAppointmentsTabState();
}

class _PartnerAppointmentsTabState extends State<PartnerAppointmentsTab> {
  DateTime _focusedDate = DateTime.now();
  String _activeFilter = 'All';

  // Mock appointments — in a real implementation these would come from a provider.
  final List<Map<String, dynamic>> _allAppointments = const [
    {
      'time': '09:00',
      'patient': 'Adewale Thompson',
      'type': 'General Consultation',
      'status': 'Confirmed',
    },
    {
      'time': '10:30',
      'patient': 'Chinense Okere',
      'type': 'Cardiology Follow-up',
      'status': 'Pending',
    },
    {
      'time': '11:45',
      'patient': 'Fatima Yusuf',
      'type': 'Lab Results Review',
      'status': 'Confirmed',
    },
    {
      'time': '13:00',
      'patient': 'Emeka Nwosu',
      'type': 'Annual Checkup',
      'status': 'Pending',
    },
  ];

  List<Map<String, dynamic>> get _filteredAppointments {
    if (_activeFilter == 'All') return _allAppointments;
    return _allAppointments
        .where((a) => a['status'] == _activeFilter)
        .toList();
  }

  /// Build the 6-day strip centred around [_focusedDate].
  List<DateTime> get _calendarWeek {
    // Show Mon-Sat of the current week containing _focusedDate.
    final monday = _focusedDate.subtract(
      Duration(days: _focusedDate.weekday - 1),
    );
    return List.generate(6, (i) => monday.add(Duration(days: i)));
  }

  String _monthLabel(DateTime d) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return '${months[d.month - 1]} ${d.year}';
  }

  void _showCheckInSheet(Map<String, dynamic> apt) {
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
            // Drag handle
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
              apt['patient'] as String,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            Text(
              '${apt['type']}  •  ${apt['time']}',
              style: const TextStyle(color: AppColors.onSurfaceVariant, fontSize: 13),
            ),
            const SizedBox(height: AppSpacing.lg),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    icon: const Icon(Icons.login, size: 18),
                    label: const Text('Check In'),
                    onPressed: () {
                      Navigator.of(ctx).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('${apt['patient']} checked in.')),
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
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Reschedule flow coming soon.')),
                      );
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
                onPressed: () {
                  Navigator.of(ctx).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('${apt['patient']}\'s appointment cancelled.')),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final week = _calendarWeek;
    final confirmed = _allAppointments.where((a) => a['status'] == 'Confirmed').length;
    final pending = _allAppointments.where((a) => a['status'] == 'Pending').length;

    return SafeArea(
      child: SingleChildScrollView(
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

            // ── Calendar Strip ──────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(AppRadii.lg),
                border: Border.all(
                  color: AppColors.outlineVariant.withValues(alpha: 0.2),
                ),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _monthLabel(_focusedDate),
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.chevron_left, size: 20),
                            visualDensity: VisualDensity.compact,
                            onPressed: () => setState(() {
                              _focusedDate = _focusedDate.subtract(
                                const Duration(days: 7),
                              );
                            }),
                          ),
                          IconButton(
                            icon: const Icon(Icons.chevron_right, size: 20),
                            visualDensity: VisualDensity.compact,
                            onPressed: () => setState(() {
                              _focusedDate = _focusedDate.add(
                                const Duration(days: 7),
                              );
                            }),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Divider(height: AppSpacing.lg),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: week.map((day) {
                      const weekdays = ['M', 'T', 'W', 'T', 'F', 'S'];
                      final label = weekdays[day.weekday - 1];
                      final isToday = day.day == DateTime.now().day &&
                          day.month == DateTime.now().month &&
                          day.year == DateTime.now().year;
                      final isSelected = day.day == _focusedDate.day &&
                          day.month == _focusedDate.month;
                      return GestureDetector(
                        onTap: () => setState(() => _focusedDate = day),
                        child: _buildCalDay(
                          day.day.toString(),
                          label,
                          selected: isSelected,
                          isToday: isToday,
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // ── Filter Chips ───────────────────────────────────────────────
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('All (${_allAppointments.length})', 'All'),
                  const SizedBox(width: AppSpacing.sm),
                  _buildFilterChip('Confirmed ($confirmed)', 'Confirmed'),
                  const SizedBox(width: AppSpacing.sm),
                  _buildFilterChip('Pending ($pending)', 'Pending'),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // ── Appointment List ───────────────────────────────────────────
            if (_filteredAppointments.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.xl),
                  child: Text(
                    'No $_activeFilter appointments today.',
                    style: textTheme.bodySmall,
                  ),
                ),
              )
            else
              Card(
                child: Column(
                  children: [
                    for (int i = 0; i < _filteredAppointments.length; i++) ...[
                      if (i > 0) const Divider(height: 1, indent: 16, endIndent: 16),
                      _buildAppointmentRow(_filteredAppointments[i]),
                    ],
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildCalDay(
    String day,
    String weekday, {
    bool selected = false,
    bool isToday = false,
  }) {
    return Column(
      children: [
        Text(
          weekday,
          style: TextStyle(
            fontSize: 11,
            color: selected ? AppColors.primary : AppColors.outline,
            fontWeight: selected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: selected
                ? AppColors.primary
                : isToday
                    ? AppColors.primaryContainer.withValues(alpha: 0.3)
                    : Colors.transparent,
            shape: BoxShape.circle,
            border: isToday && !selected
                ? Border.all(color: AppColors.primary, width: 1.5)
                : null,
          ),
          child: Center(
            child: Text(
              day,
              style: TextStyle(
                color: selected ? Colors.white : AppColors.onBackground,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
        ),
      ],
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

  Widget _buildAppointmentRow(Map<String, dynamic> apt) {
    final textTheme = Theme.of(context).textTheme;
    final isConfirmed = apt['status'] == 'Confirmed';
    final statusColor = isConfirmed ? AppColors.secondary : AppColors.primary;

    return InkWell(
      onTap: () => _showCheckInSheet(apt),
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
              apt['time'] as String,
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
                    apt['patient'] as String,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(apt['type'] as String, style: textTheme.bodySmall),
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
                        apt['status'] as String,
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
