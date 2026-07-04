import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'providers/activity_provider.dart';
import 'providers/appointment_provider.dart';
import 'providers/auth_provider.dart';
import 'providers/directory_provider.dart';
import 'providers/medication_provider.dart';
import 'providers/notification_provider.dart';
import 'providers/partner_provider.dart';
import 'providers/plan_provider.dart';
import 'providers/vault_provider.dart';
import 'providers/wallet_provider.dart';
import 'routing/app_router.dart';
import 'services/activity_service.dart';
import 'services/api_client.dart';
import 'services/appointment_service.dart';
import 'services/auth_service.dart';
import 'services/directory_service.dart';
import 'services/medication_service.dart';
import 'services/notification_service.dart';
import 'services/plan_service.dart';
import 'services/provider_service.dart';
import 'services/secure_storage_service.dart';
import 'services/vault_service.dart';
import 'services/wallet_service.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const TreatRyteApp());
}

class TreatRyteApp extends StatefulWidget {
  const TreatRyteApp({super.key});

  @override
  State<TreatRyteApp> createState() => _TreatRyteAppState();
}

class _TreatRyteAppState extends State<TreatRyteApp> {
  late final SecureStorageService _storage;
  late final ApiClient _apiClient;
  late final AuthProvider _authProvider;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _storage = SecureStorageService();
    _apiClient = ApiClient(_storage);
    _authProvider = AuthProvider(AuthService(_apiClient, _storage))..checkSession();
    // Built once and kept alive for the app's lifetime - GoRouter owns
    // navigation stack state, so recreating it on every rebuild (e.g. every
    // time AuthProvider notifies) would reset the user's navigation stack.
    _router = createAppRouter(_authProvider);
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _authProvider),
        ChangeNotifierProvider(create: (_) => WalletProvider(WalletService(_apiClient))),
        ChangeNotifierProvider(create: (_) => ActivityProvider(ActivityService(_apiClient))),
        ChangeNotifierProvider(create: (_) => VaultProvider(VaultService(_apiClient))),
        ChangeNotifierProvider(create: (_) => DirectoryProvider(DirectoryService(_apiClient))),
        ChangeNotifierProvider(create: (_) => AppointmentProvider(AppointmentService(_apiClient))),
        ChangeNotifierProvider(create: (_) => MedicationProvider(MedicationService(_apiClient))),
        ChangeNotifierProvider(create: (_) => NotificationProvider(NotificationService(_apiClient))),
        ChangeNotifierProvider(create: (_) => PlanProvider(PlanService(_apiClient))),
        ChangeNotifierProvider(create: (_) => PartnerProvider(ProviderService(_apiClient))),
      ],
      child: MaterialApp.router(
        title: 'TreatRyte',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        routerConfig: _router,
        // The UI is built mobile-first and hasn't been adapted for wide
        // desktop layouts yet - on web, constrain it to a centered
        // phone-width column instead of letting it stretch full-bleed
        // across the browser window. Native mobile builds are unaffected.
        builder: (context, child) {
          if (!kIsWeb || child == null) return child ?? const SizedBox.shrink();
          return ColoredBox(
            color: AppColors.surfaceContainerHigh,
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: child,
              ),
            ),
          );
        },
      ),
    );
  }
}
