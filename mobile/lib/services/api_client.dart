import 'package:dio/dio.dart';

import '../config/env.dart';
import 'secure_storage_service.dart';

class ApiException implements Exception {
  ApiException({required this.statusCode, required this.message, this.code});

  final int? statusCode;
  final String message;
  final String? code;

  @override
  String toString() => message;
}

/// Thrown specifically when a request fails auth and the refresh attempt
/// also failed - callers can catch this to force a logout/navigate to login.
class SessionExpiredException extends ApiException {
  SessionExpiredException() : super(statusCode: 401, message: 'Session expired', code: 'SESSION_EXPIRED');
}

class ApiClient {
  ApiClient(this._storage) {
    _dio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl));
    _refreshDio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl));

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          if (!_isAuthEndpoint(options.path)) {
            final token = await _storage.accessToken;
            if (token != null) {
              options.headers['Authorization'] = 'Bearer $token';
            }
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final isUnauthorized = error.response?.statusCode == 401;
          final isAuthEndpoint = _isAuthEndpoint(error.requestOptions.path);

          if (isUnauthorized && !isAuthEndpoint) {
            try {
              await _refreshTokens();
              final retryResponse = await _retry(error.requestOptions);
              return handler.resolve(retryResponse);
            } catch (_) {
              await _storage.clear();
              return handler.reject(
                DioException(requestOptions: error.requestOptions, error: SessionExpiredException()),
              );
            }
          }
          handler.next(error);
        },
      ),
    );
  }

  late final Dio _dio;
  late final Dio _refreshDio;
  final SecureStorageService _storage;

  // Prevents concurrent 401s from each independently calling /auth/refresh.
  Future<void>? _refreshInFlight;

  bool _isAuthEndpoint(String path) =>
      path.contains('/auth/login') || path.contains('/auth/register') || path.contains('/auth/refresh');

  Future<void> _refreshTokens() {
    _refreshInFlight ??= _doRefresh().whenComplete(() => _refreshInFlight = null);
    return _refreshInFlight!;
  }

  Future<void> _doRefresh() async {
    final refreshToken = await _storage.refreshToken;
    if (refreshToken == null) throw SessionExpiredException();

    final response = await _refreshDio.post('/auth/refresh', data: {'refreshToken': refreshToken});
    await _storage.saveTokens(
      accessToken: response.data['accessToken'],
      refreshToken: response.data['refreshToken'],
    );
  }

  Future<Response<dynamic>> _retry(RequestOptions requestOptions) async {
    final token = await _storage.accessToken;
    final options = Options(method: requestOptions.method, headers: {
      ...requestOptions.headers,
      'Authorization': 'Bearer $token',
    });
    return _dio.request(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: options,
    );
  }

  Future<T> _handle<T>(Future<Response<dynamic>> Function() request, T Function(dynamic data) onSuccess) async {
    try {
      final response = await request();
      return onSuccess(response.data);
    } on DioException catch (e) {
      if (e.error is ApiException) throw e.error as ApiException;

      final data = e.response?.data;
      final message = data is Map ? (data['message'] ?? 'Something went wrong') : 'Network error';
      final code = data is Map ? data['code'] as String? : null;
      throw ApiException(statusCode: e.response?.statusCode, message: message.toString(), code: code);
    }
  }

  Future<T> get<T>(String path, T Function(dynamic data) onSuccess, {Map<String, dynamic>? query}) =>
      _handle(() => _dio.get(path, queryParameters: query), onSuccess);

  Future<T> post<T>(String path, T Function(dynamic data) onSuccess, {dynamic body}) =>
      _handle(() => _dio.post(path, data: body), onSuccess);

  Future<T> patch<T>(String path, T Function(dynamic data) onSuccess, {dynamic body}) =>
      _handle(() => _dio.patch(path, data: body), onSuccess);

  Future<void> putRaw(String url, List<int> bytes, {required String contentType}) async {
    await _dio.put(
      url,
      data: bytes,
      options: Options(headers: {'Content-Type': contentType}),
    );
  }
}
