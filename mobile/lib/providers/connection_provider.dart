import 'package:flutter/foundation.dart';

import '../models/connection_models.dart';
import '../services/api_client.dart';
import '../services/connection_service.dart';

class ConnectionProvider extends ChangeNotifier {
  ConnectionProvider(this._service);

  final ConnectionService _service;

  List<PartnerConnection> connections = [];
  bool isLoading = false;
  String? errorMessage;

  List<PartnerConnection> get pending => connections.where((c) => c.status == 'pending').toList();

  Future<void> refresh() async {
    isLoading = true;
    notifyListeners();
    try {
      connections = await _service.list();
      errorMessage = null;
    } on ApiException catch (e) {
      errorMessage = e.message;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> accept(String id, {required bool shareAll, List<String>? folderIds}) async {
    try {
      await _service.accept(id, shareAll: shareAll, folderIds: folderIds);
      await refresh();
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<bool> decline(String id) async {
    try {
      await _service.decline(id);
      await refresh();
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }
}
