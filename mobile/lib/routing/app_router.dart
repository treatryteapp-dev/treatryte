import 'package:go_router/go_router.dart';

import '../models/directory_models.dart';
import '../models/vault_models.dart';
import '../providers/auth_provider.dart';
import '../screens/book_test_screen.dart';
import '../screens/fund_wallet_screen.dart';
import '../screens/get_started_screen.dart';
import '../screens/invitations_screen.dart';
import '../screens/join_screen.dart';
import '../screens/lab_detail_screen.dart';
import '../screens/login_screen.dart';
import '../screens/main_shell.dart';
import '../screens/notifications_screen.dart';
import '../screens/register_screen.dart';
import '../screens/partner_register_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/subscription_plans_screen.dart';
import '../screens/vault_folder_screen.dart';
import '../screens/verify_email_screen.dart';
import '../screens/withdraw_pay_screen.dart';
import '../screens/scan_upload_screen.dart';
import '../models/connection_models.dart';
import '../screens/partner_connection_detail_screen.dart';

const _publicPaths = {
  '/',
  '/join',
  '/login',
  '/register',
  '/partner-register',
  '/verify-email',
};

GoRouter createAppRouter(AuthProvider authProvider) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: authProvider,
    redirect: (context, state) {
      if (authProvider.status == AuthStatus.unknown) {
        return null;
      }
      final loggedIn = authProvider.isAuthenticated;
      final isPublicPath = _publicPaths.contains(state.matchedLocation);
      if (!loggedIn && !isPublicPath) return '/login';
      if (loggedIn && isPublicPath) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (context, state) => const GetStartedScreen()),
      GoRoute(path: '/join', builder: (context, state) => const JoinScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/partner-register',
        builder: (context, state) => const PartnerRegisterScreen(),
      ),
      GoRoute(
        path: '/verify-email',
        builder: (context, state) =>
            VerifyEmailScreen(email: state.extra as String),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const MainShell(),
      ),
      GoRoute(
        path: '/fund-wallet',
        builder: (context, state) => const FundWalletScreen(),
      ),
      GoRoute(
        path: '/withdraw-pay',
        builder: (context, state) => const WithdrawPayScreen(),
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/book-test',
        builder: (context, state) =>
            BookTestScreen(booking: state.extra as BookTestArgs),
      ),
      GoRoute(
        path: '/lab-detail',
        builder: (context, state) => LabDetailScreen(lab: state.extra as Lab),
      ),
      GoRoute(
        path: '/subscription-plans',
        builder: (context, state) => const SubscriptionPlansScreen(),
      ),
      GoRoute(
        path: '/scan-upload',
        builder: (context, state) => const ScanUploadScreen(),
      ),
      GoRoute(
        path: '/vault-folder',
        builder: (context, state) =>
            VaultFolderScreen(folder: state.extra as VaultFolder),
      ),
      GoRoute(
        path: '/invitations',
        builder: (context, state) => const InvitationsScreen(),
      ),
      GoRoute(
        path: '/vault/connection/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          final connection = state.extra as PartnerConnection;
          return PartnerConnectionDetailScreen(
            connectionId: id,
            initialConnection: connection,
          );
        },
      ),
    ],
  );
}
