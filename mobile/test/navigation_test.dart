import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:treatryte/main.dart';

void main() {
  // Registration/login now call the real backend API, so only pure
  // client-side navigation is covered here. Login-gated flows (dashboard,
  // wallet, vault, etc.) are verified manually against a running backend,
  // the same way each backend phase was curl-verified during development.

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

  testWidgets('Registration form has no BVN/NIN field', (WidgetTester tester) async {
    await tester.pumpWidget(const TreatRyteApp());
    await tester.pumpAndSettle();

    await tester.tap(find.text('Get Started'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Become a User'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Continue Registration'));
    await tester.pumpAndSettle();

    expect(find.textContaining('BVN'), findsNothing);
    expect(find.textContaining('NIN'), findsNothing);
    expect(find.text('EMAIL ADDRESS'), findsOneWidget);
    expect(find.text('PASSWORD'), findsOneWidget);
  });
}
