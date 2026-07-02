import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:treatryte/screens/subscription_plans_screen.dart';
import 'package:treatryte/theme/app_theme.dart';

void main() {
  testWidgets('Subscription plans screen renders all three tiers and lets you switch', (tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: AppTheme.light,
      home: const SubscriptionPlansScreen(),
    ));
    await tester.pumpAndSettle();

    expect(find.text('Upgrade your Coverage'), findsOneWidget);
    expect(find.text('Free'), findsOneWidget);
    expect(find.text('Standard'), findsOneWidget);
    expect(find.text('Family Plan'), findsOneWidget);
    expect(find.text('BEST VALUE'), findsOneWidget);
    expect(find.text('Continue with Standard'), findsOneWidget);

    await tester.scrollUntilVisible(
      find.text('Family Plan'),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.text('Family Plan'));
    await tester.pumpAndSettle();
    expect(find.text('Continue with Family Plan'), findsOneWidget);

    await tester.scrollUntilVisible(
      find.text('Continue with Family Plan'),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.text('Continue with Family Plan'));
    await tester.pump();
    expect(find.textContaining('Family Plan plan checkout is coming soon'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
