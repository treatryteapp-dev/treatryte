import 'package:flutter/material.dart';

/// Maps the backend's `iconKey` strings (see activity.service.js) to a
/// concrete Flutter icon, keeping icon choice a client-only concern.
IconData iconForKey(String key) {
  switch (key) {
    case 'science_outlined':
      return Icons.science_outlined;
    case 'medication':
      return Icons.medication_outlined;
    case 'account_balance_wallet':
      return Icons.account_balance_wallet_outlined;
    case 'arrow_upward':
      return Icons.arrow_upward;
    case 'event_available':
      return Icons.event_available_outlined;
    default:
      return Icons.notifications_none;
  }
}
