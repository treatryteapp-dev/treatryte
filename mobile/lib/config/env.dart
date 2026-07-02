class AppConfig {
  AppConfig._();

  // Defaults to the deployed Railway backend so the app works out of the box
  // on real devices (which can't reach a dev machine's "localhost"). Point
  // at a local backend instead with:
  //   --dart-define=API_BASE_URL=http://localhost:4000/api        (iOS simulator)
  //   --dart-define=API_BASE_URL=http://10.0.2.2:4000/api         (Android emulator)
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://treatryte-backend.up.railway.app/api',
  );
}
