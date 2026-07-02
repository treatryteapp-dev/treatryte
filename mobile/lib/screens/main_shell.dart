import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import 'tabs/directory_tab.dart';
import 'tabs/home_tab.dart';
import 'tabs/meds_tab.dart';
import 'tabs/vault_tab.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _tabIndex = 0;

  static const _tabs = [
    (icon: Icons.home_filled, label: 'Home'),
    (icon: Icons.folder_shared_outlined, label: 'Vault'),
    (icon: Icons.map_outlined, label: 'Directory'),
    (icon: Icons.medication_outlined, label: 'Meds'),
  ];

  static const _pages = [
    HomeTab(),
    VaultTab(),
    DirectoryTab(),
    MedsTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _tabIndex, children: _pages),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: AppColors.onPrimary),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tabIndex,
        onDestinationSelected: (index) => setState(() => _tabIndex = index),
        destinations: [
          for (final tab in _tabs)
            NavigationDestination(icon: Icon(tab.icon), label: tab.label),
        ],
      ),
    );
  }
}
