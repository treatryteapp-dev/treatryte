class AppConfig {
  AppConfig._();

  // iOS simulator shares the host machine's network stack, so localhost
  // reaches the backend directly. Android emulators need 10.0.2.2 instead -
  // override via --dart-define=API_BASE_URL=... when running on Android.
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:4000/api',
  );
}
