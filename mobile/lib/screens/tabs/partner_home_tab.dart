import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../models/appointment_models.dart';
import '../../providers/auth_provider.dart';
import '../../providers/partner_provider.dart';
import '../../theme/app_theme.dart';

// Mirrors the fixed slot list the backend hands out (appointment.service.js
// TIME_SLOTS) so "Upcoming" can be sorted chronologically within a day -
// the strings themselves ("09:00 AM" vs "01:30 PM") don't sort correctly
// alphabetically.
const _timeSlotOrder = ['09:00 AM', '10:30 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM'];

/// Shows the Issue Record bottom sheet. Extracted as a top-level function
/// so it can be called from both the home tab button and the global FAB
/// in MainShell without creating a dependency cycle.
void showIssueRecordSheet(BuildContext context) {
  final patientCtrl = TextEditingController();
  final notesCtrl = TextEditingController();
  String selectedVisitType = 'General Consultation';
  const visitTypes = [
    'General Consultation',
    'Follow-up Visit',
    'Lab Results Review',
    'Specialist Referral',
    'Telehealth',
    'Emergency',
  ];

  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setSheetState) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Container(
          decoration: const BoxDecoration(
            color: AppColors.surfaceContainerLowest,
            borderRadius:
                BorderRadius.vertical(top: Radius.circular(AppRadii.xl)),
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
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.outlineVariant,
                    borderRadius: BorderRadius.circular(AppRadii.full),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  const Icon(Icons.assignment_outlined, color: AppColors.primary),
                  const SizedBox(width: AppSpacing.sm),
                  const Text(
                    'Issue Medical Record',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              TextField(
                controller: patientCtrl,
                decoration: const InputDecoration(
                  labelText: 'Patient Name or ID',
                  hintText: 'e.g. Aisha Bello or TR-8821',
                  prefixIcon: Icon(Icons.person_search_outlined),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              InputDecorator(
                decoration: const InputDecoration(labelText: 'Visit Type'),
                child: DropdownButton<String>(
                  value: selectedVisitType,
                  underline: const SizedBox.shrink(),
                  isExpanded: true,
                  items: visitTypes
                      .map((t) => DropdownMenuItem<String>(value: t, child: Text(t)))
                      .toList(),
                  onChanged: (val) =>
                      setSheetState(() => selectedVisitType = val ?? selectedVisitType),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              TextField(
                controller: notesCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Clinical Notes',
                  hintText: 'Findings, symptoms, treatment plan...',
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  icon: const Icon(Icons.save_outlined, size: 18),
                  label: const Text('Save Record'),
                  onPressed: () {
                    Navigator.of(ctx).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Medical record issued successfully.'),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

class PartnerHomeTab extends StatefulWidget {
  const PartnerHomeTab({super.key});

  @override
  State<PartnerHomeTab> createState() => _PartnerHomeTabState();
}

class _PartnerHomeTabState extends State<PartnerHomeTab> {
  bool _loaded = false;

  bool _isToday(String? scheduledDate) {
    if (scheduledDate == null) return false;
    final date = DateTime.tryParse(scheduledDate);
    if (date == null) return false;
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month && date.day == now.day;
  }

  bool _isTodayOrFuture(String? scheduledDate) {
    if (scheduledDate == null) return false;
    final date = DateTime.tryParse(scheduledDate);
    if (date == null) return false;
    final now = DateTime.now();
    final todayStart = DateTime(now.year, now.month, now.day);
    return !date.isBefore(todayStart);
  }

  List<Appointment> _upcoming(List<Appointment> all) {
    final upcoming = all
        .where((a) => a.status != 'cancelled' && _isTodayOrFuture(a.scheduledDate))
        .toList();
    upcoming.sort((a, b) {
      final dateCompare = (a.scheduledDate ?? '').compareTo(b.scheduledDate ?? '');
      if (dateCompare != 0) return dateCompare;
      final aIndex = _timeSlotOrder.indexOf(a.scheduledTimeSlot ?? '');
      final bIndex = _timeSlotOrder.indexOf(b.scheduledTimeSlot ?? '');
      return aIndex.compareTo(bIndex);
    });
    return upcoming.take(3).toList();
  }

  String _timeAgo(DateTime? dt) {
    if (dt == null) return '';
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min${diff.inMinutes == 1 ? '' : 's'} ago';
    if (diff.inHours < 24) return '${diff.inHours} hour${diff.inHours == 1 ? '' : 's'} ago';
    return '${diff.inDays} day${diff.inDays == 1 ? '' : 's'} ago';
  }

  String _formatNaira(int kobo) => '₦${(kobo / 100).toStringAsFixed(2)}';

  ({IconData icon, Color color, Color bg, String title}) _activityDetails(Appointment apt) {
    final patient = apt.patientName ?? 'A patient';
    final service = apt.serviceType ?? 'a service';
    switch (apt.status) {
      case 'confirmed':
        return (icon: Icons.payments, color: AppColors.secondary, bg: AppColors.secondaryContainer, title: '$patient paid for $service');
      case 'checked_in':
        return (icon: Icons.login, color: AppColors.primary, bg: AppColors.primary.withValues(alpha: 0.1), title: '$patient checked in for $service');
      case 'cancelled':
        return (icon: Icons.cancel, color: AppColors.error, bg: AppColors.errorContainer, title: '$patient cancelled an appointment');
      default:
        return (icon: Icons.schedule, color: AppColors.onSurfaceVariant, bg: AppColors.surfaceContainerHigh, title: '$patient booked $service');
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().currentUser;
    final textTheme = Theme.of(context).textTheme;
    final partner = context.watch<PartnerProvider>();

    if (!_loaded) {
      _loaded = true;
      final provider = context.read<PartnerProvider>();
      Future.microtask(() => provider.loadAppointments());
    }

    final all = partner.appointments;
    final todays = all.where((a) => _isToday(a.scheduledDate)).toList();
    final completedToday = todays.where((a) => a.status == 'checked_in').length;
    final remainingToday = todays.where((a) => a.status != 'checked_in' && a.status != 'cancelled').length;
    final upcoming = _upcoming(all);
    final recentActivity = all.take(3).toList();

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top App Bar Header
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Hello, ${user?.fullName ?? 'Doctor'} 👋', style: textTheme.headlineMedium),
                      const SizedBox(height: 2),
                      Text('Partner Portal Dashboard', style: textTheme.bodySmall),
                    ],
                  ),
                ),
                IconButton.filledTonal(
                  onPressed: () => context.push('/notifications'),
                  icon: const Icon(Icons.notifications_none),
                ),
                const SizedBox(width: AppSpacing.sm),
                GestureDetector(
                  onTap: () => context.push('/profile'),
                  child: CircleAvatar(
                    radius: 20,
                    backgroundColor: AppColors.primaryContainer,
                    backgroundImage: user?.avatarUrl != null ? NetworkImage(user!.avatarUrl!) : null,
                    child: user?.avatarUrl == null
                        ? Text(
                            _initials(user?.fullName ?? '?'),
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                          )
                        : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),

            // Today's Overview Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppColors.primaryContainer, AppColors.primary],
                ),
                borderRadius: BorderRadius.circular(AppRadii.lg),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'TODAY\'S OVERVIEW',
                    style: textTheme.labelSmall?.copyWith(color: Colors.white70, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    '${todays.length} Appointment${todays.length == 1 ? '' : 's'}',
                    style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Row(
                    children: [
                      const Icon(Icons.check_circle, size: 16, color: Colors.white70),
                      const SizedBox(width: 4),
                      Text('$completedToday Completed', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                      const SizedBox(width: AppSpacing.md),
                      const Icon(Icons.schedule, size: 16, color: Colors.white70),
                      const SizedBox(width: 4),
                      Text('$remainingToday Remaining', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  ElevatedButton.icon(
                    onPressed: () => showIssueRecordSheet(context),
                    icon: const Icon(Icons.assignment_outlined, size: 18),
                    label: const Text('Issue Record'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppColors.primary,
                      minimumSize: const Size.fromHeight(48),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            // Upcoming Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Upcoming', style: textTheme.headlineSmall),
                TextButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Switch to the Appointments tab to see all.')),
                    );
                  },
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            if (partner.isLoadingAppointments && all.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: AppSpacing.lg),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (upcoming.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                child: Text('No upcoming appointments.', style: textTheme.bodySmall),
              )
            else
              for (final apt in upcoming) ...[
                _buildUpcomingCard(
                  name: apt.patientName ?? 'Patient',
                  type: apt.serviceType ?? 'Appointment',
                  time: apt.scheduledTimeSlot ?? '--',
                ),
                const SizedBox(height: AppSpacing.sm),
              ],
            const SizedBox(height: AppSpacing.md),

            // Recent Activity Section
            Text('Recent Activity', style: textTheme.headlineSmall),
            const SizedBox(height: AppSpacing.sm),
            if (recentActivity.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                child: Text('No activity yet.', style: textTheme.bodySmall),
              )
            else
              Card(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                  child: Column(
                    children: [
                      for (var i = 0; i < recentActivity.length; i++) ...[
                        if (i > 0) const Divider(),
                        Builder(builder: (context) {
                          final apt = recentActivity[i];
                          final details = _activityDetails(apt);
                          return _buildActivityTile(
                            icon: details.icon,
                            iconColor: details.color,
                            iconBg: details.bg,
                            title: details.title,
                            subtitle: '${_timeAgo(apt.createdAt)} • ${_formatNaira(apt.totalKobo)}',
                          );
                        }),
                      ],
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return (parts.first[0] + parts.last[0]).toUpperCase();
  }

  Widget _buildUpcomingCard({
    required String name,
    required String type,
    required String time,
  }) {
    final textTheme = Theme.of(context).textTheme;
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadii.lg),
        side: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: AppColors.primaryContainer,
              child: Text(_initials(name), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold, color: AppColors.onBackground)),
                  const SizedBox(height: 2),
                  Text(type, style: textTheme.bodySmall),
                ],
              ),
            ),
            Text(time, style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary)),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityTile({
    required IconData icon,
    required Color iconColor,
    required Color iconBg,
    required String title,
    required String subtitle,
  }) {
    final textTheme = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: iconBg,
              borderRadius: BorderRadius.circular(AppRadii.md),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600, color: AppColors.onBackground),
                ),
                const SizedBox(height: 2),
                Text(subtitle, style: textTheme.bodySmall),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
