import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';

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
  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().currentUser;
    final textTheme = Theme.of(context).textTheme;

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
                const CircleAvatar(
                  radius: 20,
                  backgroundColor: AppColors.primaryContainer,
                  child: Text('DR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
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
                  const Text(
                    '12 Appointments',
                    style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  const Row(
                    children: [
                      Icon(Icons.check_circle, size: 16, color: Colors.white70),
                      SizedBox(width: 4),
                      Text('8 Completed', style: TextStyle(color: Colors.white70, fontSize: 13)),
                      SizedBox(width: AppSpacing.md),
                      Icon(Icons.schedule, size: 16, color: Colors.white70),
                      SizedBox(width: 4),
                      Text('4 Remaining', style: TextStyle(color: Colors.white70, fontSize: 13)),
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
            _buildUpcomingCard(
              name: 'Chinua Achebe',
              type: 'General Consultation',
              time: '14:30',
              mode: 'In-Person',
              imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDvQtzYuccfhe1kB4LICRSkt9hLZuuUfGy-U_IFasiG_45SQeaFWp3XX4O20lG0E-KOW-f6A7KPtoNs8YkHCRlMQlzlx9y-400l-834jURPVHHEtuK13VRTjga0QcsJEFZO3Z2ObtrgcIQVCMBw34UNVTZC1lC_LOW1gdxQ8U0EvVCG27MQ0tjRK8aNwKKvTDvH7fBkI8jLdoucnSDZXZdNLvXnuBJoJRaQXRPYL40EnXfpEZ0YbWPaOSrWO1pbYwWrVCY1SA9jqk',
            ),
            const SizedBox(height: AppSpacing.sm),
            _buildUpcomingCard(
              name: 'Amara Okafor',
              type: 'Lab Results Review',
              time: '15:15',
              mode: 'Telehealth',
              imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy9tF-ls_Qa4P6bASBpj9Y4pf8HjvB7sxZLvMuFAAUyQ3m7xLfe0rD8P5LYxYmT1jjhHtQGU79QY-Rg2gOkmarTXG2Tuc-sktIj66nECguKCUuQ3km2j_FwqftqceVjC48eEYothEuUqwGwaVVimMI7aZ-sNudIOqXAXTlin8r0cbGcF2D2NhMuDjP1gnmLc3WPc02zYK7D1mIgg4_D-Q6TOrn_jycygNN9LTdZ4A24wPE30euPHdodo2PH7TjiOiqmDmj3L0cNOQ',
            ),
            const SizedBox(height: AppSpacing.sm),
            _buildUpcomingCard(
              name: 'Bello Ibrahim',
              type: 'Follow-up Visit',
              time: '16:00',
              mode: 'In-Person',
              imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD251BdOzc__DCck36cVyCwDPcCuKdmk-8_rAWMKxZnox_6qbfNWf8H6STeT0mjzETSzoRUVve_6Nb_4lF2ivrG96m59Y1IXQtQaSr5w-mPxpKmo_fS6k1OM-pIAg-8-jGrrI0s39ndYX1hzjD8mPqgDTaAUqlAQ-xM5dduZRvcrJ_NeMJLqBCWUFSE119w5upKP_WQSmupuXwHfCyVO-ZSt3JdiVPdZgEd3YOLmogJQbUYYrG4xRCw3SRqcKAhimkMqgn1Rc9uS-8',
            ),
            const SizedBox(height: AppSpacing.xl),

            // Recent Activity Section
            Text('Recent Activity', style: textTheme.headlineSmall),
            const SizedBox(height: AppSpacing.sm),
            Card(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Column(
                  children: [
                    _buildActivityTile(
                      icon: Icons.payments,
                      iconColor: AppColors.secondary,
                      iconBg: AppColors.secondaryContainer,
                      title: 'Emeka Kalu paid for Consultation',
                      subtitle: '2 mins ago • ₦15,000.00',
                    ),
                    const Divider(),
                    _buildActivityTile(
                      icon: Icons.description,
                      iconColor: AppColors.primary,
                      iconBg: AppColors.primary.withValues(alpha: 0.1),
                      title: 'Medical Record uploaded for Sarah Bello',
                      subtitle: '15 mins ago • Radiology Dept.',
                    ),
                    const Divider(),
                    _buildActivityTile(
                      icon: Icons.cancel,
                      iconColor: AppColors.error,
                      iconBg: AppColors.errorContainer,
                      title: 'Tunde Ade cancelled appointment',
                      subtitle: '1 hour ago • Dr. Richards',
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUpcomingCard({
    required String name,
    required String type,
    required String time,
    required String mode,
    required String imageUrl,
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
              backgroundColor: AppColors.surfaceContainer,
              backgroundImage: NetworkImage(imageUrl),
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
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(time, style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary)),
                const SizedBox(height: 2),
                Text(mode, style: textTheme.labelSmall),
              ],
            ),
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
