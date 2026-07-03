import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class PartnerPatientsTab extends StatefulWidget {
  const PartnerPatientsTab({super.key});

  @override
  State<PartnerPatientsTab> createState() => _PartnerPatientsTabState();
}

class _PartnerPatientsTabState extends State<PartnerPatientsTab> {
  int _selectedPatientIndex = 0;
  final _searchController = TextEditingController();

  final List<Map<String, dynamic>> _patients = [
    {
      'id': '8821',
      'name': 'Aisha Bello',
      'age': 64,
      'gender': 'Female',
      'bloodGroup': 'O+',
      'allergy': 'Penicillin',
      'lastVisit': '2 days ago',
      'imageUrl': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC_CXif-olCP9UfLc9AEMBzxMuAEd7ipj6SvPaksY9nTCtJokSJTTnpbQlhaqhgeVX6uODZQFiLRybJ-eE5zj5Xt_d_1TClzd8sWCr-uX77Ld9H-spTgyrEtwA5U6QvuqsEMnqbkdxLvdvWYw7LedkShV6vaWGb1PipTibSgP-MYI7wMAEKwBISwIVCtDOvEnG-x_mDNzdtYGNYAYm3l4iNAWVFv7iTXwGceQQZhzud_Vh6t3p4BnYgc-nqlTy_yNdfbIuGWwE0BE',
      'medicalSummary': [
        {'title': 'Hypertension', 'desc': 'Diagnosed 2018. Managed with Lisinopril 10mg daily.'},
        {'title': 'Type 2 Diabetes', 'desc': 'HBA1c: 6.8% (Stable). Dietary management active.'},
        {'title': 'Cataract Surgery', 'desc': 'Left eye, successful outcome in Nov 2023.'},
      ],
      'reports': [
        {'title': 'Blood Panel Results', 'info': 'Jan 12, 2024 • 1.2 MB', 'format': 'pdf'},
        {'title': 'Chest X-Ray DICOM', 'info': 'Dec 20, 2023 • 45 MB', 'format': 'dicom'},
        {'title': 'ECG Recording', 'info': 'Dec 15, 2023 • 0.8 MB', 'format': 'ecg'},
      ],
    },
    {
      'id': '9012',
      'name': 'Chidi Okafor',
      'age': 45,
      'gender': 'Male',
      'bloodGroup': 'A+',
      'allergy': 'Sulfa drugs',
      'lastVisit': '1 week ago',
      'imageUrl': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVNCvtm8DeMxMTysikAJpe8VpiyqBnjzr6q2uNcQwBcZVc0FktlheGJiU58qztz-HKhsZ0jznpOzvP5-t-7uzfJKhGIa1_VfDAkmjr4TAMnBCYa-uNyvbUfQFzV8D8gdfchTJyZQ5Z7zGAlsfXTltZEkVJARIGcYpyoEo0bG31JKeNYpYx5nroy3peqowzsI3hAVa6wFCX7uVl7XCTK60IgNclmx1LlizNLpCNcl-vAIJelhXwXsmCSS2uGrj3aMj5-cAGdE0tyQI',
      'medicalSummary': [
        {'title': 'Allergic Rhinitis', 'desc': 'Seasonal. Uses Cetirizine as needed.'},
      ],
      'reports': [
        {'title': 'Urinalysis Report', 'info': 'Mar 01, 2024 • 0.5 MB', 'format': 'pdf'},
      ],
    },
    {
      'id': '7741',
      'name': 'Funmi Adeyemi',
      'age': 28,
      'gender': 'Female',
      'bloodGroup': 'B-',
      'allergy': 'None',
      'lastVisit': '3 weeks ago',
      'imageUrl': 'https://lh3.googleusercontent.com/aida-public/AB6AXuALfwaiG7Yy_Bx6r8ZAReWpNdNfBNesILuj4Yx9e9W45MZey-2JuKCDNMzDUwlNzT2OtA1fUt4BK4otRCOAmfBEhz6OSBkKKXE2haTXgpcuhbPCRuWaQWRUpI5sbNaOvbsJHAjH_80yUa7U-I2oteNiE6ybXcC2jJjCCoUe-deVQ9z1AvowNKWkpkHbdNumn0KpE4cvfDxRb00OqDTfbrxE4G07A6NiasxvgUMY69WPFbrzpx4Zj-DZcgHQXz-xvW3Tgd_YYR5d0Ws',
      'medicalSummary': [
        {'title': 'Asthma', 'desc': 'Mild intermittent. Uses Albuterol inhaler.'},
      ],
      'reports': [
        {'title': 'Pulmonary Function Test', 'info': 'Feb 10, 2024 • 1.5 MB', 'format': 'pdf'},
      ],
    }
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showShareDialog() {
    showDialog(
      context: context,
      builder: (context) {
        final textTheme = Theme.of(context).textTheme;
        return AlertDialog(
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Share Records', style: textTheme.headlineSmall),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Send via QR
              InkWell(
                onTap: () {
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Generating sharing QR code...')),
                  );
                },
                borderRadius: BorderRadius.circular(AppRadii.lg),
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(AppRadii.lg),
                    border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.qr_code_2, size: 64, color: AppColors.primary),
                      const SizedBox(height: AppSpacing.sm),
                      Text('Send via QR', style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 2),
                      Text(
                        'Patient scans this to receive their report instantly.',
                        style: textTheme.bodySmall,
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              const Row(
                children: [
                  Expanded(child: Divider()),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                    child: Text('OR', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.outline)),
                  ),
                  Expanded(child: Divider()),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              // Send via ID
              InkWell(
                onTap: () {
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Search patient ID to share...')),
                  );
                },
                borderRadius: BorderRadius.circular(AppRadii.lg),
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(AppRadii.lg),
                    border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.sm),
                        decoration: BoxDecoration(
                          color: AppColors.secondary.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.fingerprint, color: AppColors.secondary),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Send via ID', style: TextStyle(fontWeight: FontWeight.bold)),
                            Text('Enter patient\'s TreatRyte ID', style: TextStyle(color: AppColors.outline, fontSize: 13)),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right, color: AppColors.outline),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final activePatient = _patients[_selectedPatientIndex];

    return SafeArea(
      child: Column(
        children: [
          // Search & Header Area
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            color: AppColors.surfaceContainerLowest,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Patient Directory', style: textTheme.headlineSmall),
                const SizedBox(height: 2),
                Text('Manage and access your patient records.', style: textTheme.bodySmall),
                const SizedBox(height: AppSpacing.md),
                TextField(
                  controller: _searchController,
                  decoration: const InputDecoration(
                    hintText: 'Search by name or ID...',
                    prefixIcon: Icon(Icons.search, color: AppColors.outline),
                  ),
                ),
              ],
            ),
          ),

          // Horizontal patient list tabs
          Container(
            height: 72,
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.2))),
            ),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              itemCount: _patients.length,
              itemBuilder: (context, index) {
                final patient = _patients[index];
                final isSelected = index == _selectedPatientIndex;
                return Padding(
                  padding: const EdgeInsets.only(right: AppSpacing.sm),
                  child: ChoiceChip(
                    avatar: CircleAvatar(
                      backgroundImage: NetworkImage(patient['imageUrl']),
                    ),
                    label: Text(patient['name']),
                    selected: isSelected,
                    selectedColor: AppColors.primaryContainer.withValues(alpha: 0.2),
                    labelStyle: TextStyle(
                      color: isSelected ? AppColors.primary : AppColors.onSurfaceVariant,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadii.lg),
                      side: BorderSide(
                        color: isSelected ? AppColors.primary : AppColors.outlineVariant,
                      ),
                    ),
                    onSelected: (selected) {
                      if (selected) {
                        setState(() => _selectedPatientIndex = index);
                      }
                    },
                  ),
                );
              },
            ),
          ),

          // Patient details content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Detail Card Header
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 30,
                                backgroundImage: NetworkImage(activePatient['imageUrl']),
                              ),
                              const SizedBox(width: AppSpacing.lg),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(activePatient['name'], style: textTheme.headlineSmall),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${activePatient['age']} years old • ${activePatient['gender']}',
                                      style: textTheme.bodySmall,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.md),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppColors.secondaryContainer,
                                  borderRadius: BorderRadius.circular(AppRadii.full),
                                ),
                                child: Text(
                                  'Blood Group: ${activePatient['bloodGroup']}',
                                  style: const TextStyle(
                                    color: AppColors.onSecondaryContainer,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(width: AppSpacing.sm),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppColors.errorContainer,
                                  borderRadius: BorderRadius.circular(AppRadii.full),
                                ),
                                child: Text(
                                  'Allergy: ${activePatient['allergy']}',
                                  style: const TextStyle(
                                    color: AppColors.onErrorContainer,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const Divider(height: AppSpacing.xl),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Prescription tool is coming soon.')),
                                    );
                                  },
                                  icon: const Icon(Icons.add_reaction, size: 18),
                                  label: const Text('Add Prescription'),
                                  style: ElevatedButton.styleFrom(
                                    minimumSize: const Size.fromHeight(48),
                                  ),
                                ),
                              ),
                              const SizedBox(width: AppSpacing.sm),
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: _showShareDialog,
                                  icon: const Icon(Icons.share, size: 18),
                                  label: const Text('Share Records'),
                                  style: OutlinedButton.styleFrom(
                                    minimumSize: const Size.fromHeight(48),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // Medical Summary
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.history_edu, color: AppColors.primary, size: 20),
                              const SizedBox(width: AppSpacing.sm),
                              Text('Medical Summary', style: textTheme.headlineSmall?.copyWith(fontSize: 18)),
                            ],
                          ),
                          const Divider(height: AppSpacing.lg),
                          ...(activePatient['medicalSummary'] as List<dynamic>).map((item) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color: AppColors.surfaceContainer,
                                      borderRadius: BorderRadius.circular(AppRadii.sm),
                                    ),
                                    child: const Icon(Icons.monitor_heart, color: AppColors.secondary, size: 16),
                                  ),
                                  const SizedBox(width: AppSpacing.md),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(item['title'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                        Text(item['desc'], style: textTheme.bodySmall),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // Recent Reports
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.description, color: AppColors.primary, size: 20),
                              const SizedBox(width: AppSpacing.sm),
                              Text('Recent Reports', style: textTheme.headlineSmall?.copyWith(fontSize: 18)),
                            ],
                          ),
                          const Divider(height: AppSpacing.lg),
                          ...(activePatient['reports'] as List<dynamic>).map((report) {
                            final isPdf = report['format'] == 'pdf';
                            return Padding(
                              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                              child: Container(
                                padding: const EdgeInsets.all(AppSpacing.sm),
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceContainerLow,
                                  borderRadius: BorderRadius.circular(AppRadii.md),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      isPdf ? Icons.picture_as_pdf : Icons.settings_overscan,
                                      color: isPdf ? AppColors.error : AppColors.primary,
                                    ),
                                    const SizedBox(width: AppSpacing.sm),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(report['title'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                          Text(report['info'], style: textTheme.bodySmall?.copyWith(fontSize: 11)),
                                        ],
                                      ),
                                    ),
                                    const Icon(Icons.download, size: 18, color: AppColors.outline),
                                  ],
                                ),
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
