import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:treatryte/main.dart';
import 'package:treatryte/routing/app_router.dart';

void main() {
  // appRouter is a shared singleton, so its navigation stack leaks between
  // tests unless it's reset back to the initial route.
  tearDown(() => appRouter.go('/'));

  testWidgets('Get Started -> Join -> Login -> back navigation works',
      (WidgetTester tester) async {
    await tester.pumpWidget(const TreatRyteApp());
    await tester.pumpAndSettle();

    await tester.tap(find.text('Get Started'));
    await tester.pumpAndSettle();
    expect(find.text('Continue Registration'), findsOneWidget);

    await tester.scrollUntilVisible(
      find.text('Already have an account? Log in'),
      100,
    );
    await tester.tap(find.text('Already have an account? Log in'));
    await tester.pumpAndSettle();
    expect(find.text('Welcome Back'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.arrow_back));
    await tester.pumpAndSettle();
    expect(find.text('Continue Registration'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.arrow_back));
    await tester.pumpAndSettle();
    expect(find.text('Get Started'), findsOneWidget);
  });

  testWidgets('Selecting a role and continuing opens registration',
      (WidgetTester tester) async {
    await tester.pumpWidget(const TreatRyteApp());
    await tester.pumpAndSettle();

    await tester.tap(find.text('Get Started'));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Become a User'));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Continue Registration'));
    await tester.pumpAndSettle();
    expect(find.text('Individual Registration'), findsOneWidget);
  });

  testWidgets('Logging in opens the dashboard', (WidgetTester tester) async {
    await tester.pumpWidget(const TreatRyteApp());
    await tester.pumpAndSettle();

    await tester.tap(find.text('Log In'));
    await tester.pumpAndSettle();

    await tester.tap(find.widgetWithText(ElevatedButton, 'Log In'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Hello, Adebayo'), findsOneWidget);
  });

  testWidgets('All bottom nav tabs render without overflow',
      (WidgetTester tester) async {
    await tester.pumpWidget(const TreatRyteApp());
    await tester.pumpAndSettle();

    await tester.tap(find.text('Log In'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(ElevatedButton, 'Log In'));
    await tester.pumpAndSettle();

    for (final label in ['Vault', 'Directory', 'Meds', 'Home']) {
      await tester.tap(find.widgetWithText(NavigationDestination, label));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
    }
  });

  testWidgets('Completing registration leads to biometrics setup then dashboard',
      (WidgetTester tester) async {
    await tester.pumpWidget(const TreatRyteApp());
    await tester.pumpAndSettle();

    await tester.tap(find.text('Get Started'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Become a User'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Continue Registration'));
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(
      find.byType(Checkbox),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.byType(Checkbox));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(
      find.widgetWithText(ElevatedButton, 'Sign Up'),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.widgetWithText(ElevatedButton, 'Sign Up'));
    await tester.pumpAndSettle();
    expect(find.text('Biometric Security'), findsOneWidget);
    expect(tester.takeException(), isNull);

    await tester.scrollUntilVisible(
      find.text('Maybe Later'),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.text('Maybe Later'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Hello, Adebayo'), findsOneWidget);
  });

  testWidgets('Home tab entry points open notifications, fund wallet, and withdraw/pay',
      (WidgetTester tester) async {
    await tester.pumpWidget(const TreatRyteApp());
    await tester.pumpAndSettle();
    await tester.tap(find.text('Log In'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(ElevatedButton, 'Log In'));
    await tester.pumpAndSettle();

    await tester.tap(find.byIcon(Icons.notifications_none));
    await tester.pumpAndSettle();
    expect(find.text('Notifications'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.tap(find.byIcon(Icons.arrow_back));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Fund Wallet'));
    await tester.pumpAndSettle();
    expect(find.text('Select Payment Method'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.tap(find.byIcon(Icons.arrow_back));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Withdraw/Pay'));
    await tester.pumpAndSettle();
    expect(find.text('Withdraw to Bank'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Directory tab can open the book test flow',
      (WidgetTester tester) async {
    await tester.pumpWidget(const TreatRyteApp());
    await tester.pumpAndSettle();
    await tester.tap(find.text('Log In'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(ElevatedButton, 'Log In'));
    await tester.pumpAndSettle();

    await tester.tap(find.widgetWithText(NavigationDestination, 'Directory'));
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(
      find.text('Book & Pay Now'),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.text('Book & Pay Now'));
    await tester.pumpAndSettle();
    expect(find.text('Schedule Appointment'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
