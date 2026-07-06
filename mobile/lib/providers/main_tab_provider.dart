import 'package:flutter/foundation.dart';

/// Shared bottom-navigation tab index for MainShell, so nested tab widgets
/// (e.g. HomeTab's Quick Services grid) can navigate to a sibling tab
/// without needing a route for every destination.
class MainTabProvider extends ChangeNotifier {
  int index = 0;

  void setIndex(int value) {
    if (index == value) return;
    index = value;
    notifyListeners();
  }
}
