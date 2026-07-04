import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../providers/partner_provider.dart';
import '../theme/app_theme.dart';
import 'partner_status_screen.dart';
import 'tabs/directory_tab.dart';
import 'tabs/home_tab.dart';
import 'tabs/meds_tab.dart';
import 'tabs/vault_tab.dart';

import 'tabs/partner_home_tab.dart';
import 'tabs/partner_patients_tab.dart';
import 'tabs/partner_appointments_tab.dart';
import 'tabs/partner_services_tab.dart';
import 'tabs/partner_wallet_tab.dart';
import 'tabs/partner_plans_tab.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _tabIndex = 0;
  bool _partnerStatusLoaded = false;

  static const _patientTabs = [
    (icon: Icons.home_filled, label: 'Home'),
    (icon: Icons.folder_shared_outlined, label: 'Vault'),
    (icon: Icons.map_outlined, label: 'Directory'),
    (icon: Icons.medication_outlined, label: 'Meds'),
  ];

  static const _patientPages = [
    HomeTab(),
    VaultTab(),
    DirectoryTab(),
    MedsTab(),
  ];

  static const _providerTabs = [
    (icon: Icons.home_filled, label: 'Home'),
    (icon: Icons.group_outlined, label: 'Patients'),
    (icon: Icons.calendar_today_outlined, label: 'Appointments'),
    (icon: Icons.medical_services_outlined, label: 'Services'),
    (icon: Icons.account_balance_wallet_outlined, label: 'Wallet'),
    (icon: Icons.card_membership_outlined, label: 'Plans'),
  ];

  static const _providerPages = [
    PartnerHomeTab(),
    PartnerPatientsTab(),
    PartnerAppointmentsTab(),
    PartnerServicesTab(),
    PartnerWalletTab(),
    PartnerPlansTab(),
  ];

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().currentUser;
    final isProvider = user?.role == 'provider';

    if (isProvider) {
      final partner = context.watch<PartnerProvider>();
      if (!_partnerStatusLoaded) {
        _partnerStatusLoaded = true;
        final provider = context.read<PartnerProvider>();
        Future.microtask(() => provider.loadProfile());
      }

      if (partner.isLoading && partner.lab == null) {
        return const Scaffold(body: Center(child: CircularProgressIndicator()));
      }

      final status = partner.lab?.status;
      if (status != null && status != 'approved') {
        return PartnerStatusScreen(
          status: status,
          onRetry: () => context.read<PartnerProvider>().loadProfile(),
        );
      }
    }

    final tabs = isProvider ? _providerTabs : _patientTabs;
    final pages = isProvider ? _providerPages : _patientPages;

    // Guard against index out of range when switching roles
    if (_tabIndex >= tabs.length) {
      _tabIndex = 0;
    }

    return Scaffold(
      body: IndexedStack(index: _tabIndex, children: pages),
      floatingActionButton: isProvider
          ? FloatingActionButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Quick Record modal would open here.')),
                );
              },
              backgroundColor: AppColors.primary,
              child: const Icon(Icons.add, color: AppColors.onPrimary),
            )
          : FloatingActionButton(
              onPressed: () {},
              backgroundColor: AppColors.primary,
              child: const Icon(Icons.add, color: AppColors.onPrimary),
            ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tabIndex,
        onDestinationSelected: (index) => setState(() => _tabIndex = index),
        destinations: [
          for (final tab in tabs)
            NavigationDestination(icon: Icon(tab.icon), label: tab.label),
        ],
      ),
    );
  }
}
