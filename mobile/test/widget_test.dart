import 'package:flutter_test/flutter_test.dart';

import 'package:treatryte/main.dart';

void main() {
  testWidgets('App shows the Get Started screen', (WidgetTester tester) async {
    await tester.pumpWidget(const TreatRyteApp());
    await tester.pumpAndSettle();

    expect(find.text('TreatRyte'), findsWidgets);
    expect(find.text('Get Started'), findsOneWidget);
  });
}
