import 'package:flutter/foundation.dart';

import '../models/plan_models.dart';
import '../models/provider_models.dart';
import '../services/api_client.dart';
import '../services/provider_service.dart';

class PartnerProvider extends ChangeNotifier {
  PartnerProvider(this._service);

  final ProviderService _service;

  PartnerLab? lab;
  Plan? plan;
  List<PartnerService> services = [];
  bool isLoading = false;
  String? errorMessage;

  Future<void> loadProfile() async {
    isLoading = true;
    notifyListeners();
    try {
      final profile = await _service.getProfile();
      lab = profile.lab;
      plan = profile.plan;
      errorMessage = null;
    } on ApiException catch (e) {
      errorMessage = e.message;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadServices() async {
    isLoading = true;
    notifyListeners();
    try {
      services = await _service.listServices();
      errorMessage = null;
    } on ApiException catch (e) {
      errorMessage = e.message;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createService({required String name, required int priceKobo, required String category}) async {
    try {
      await _service.createService(name: name, priceKobo: priceKobo, category: category);
      await loadServices();
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateService(String id, {String? name, int? priceKobo, String? category}) async {
    try {
      await _service.updateService(id, name: name, priceKobo: priceKobo, category: category);
      await loadServices();
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteService(String id) async {
    try {
      await _service.deleteService(id);
      await loadServices();
      return true;
    } on ApiException catch (e) {
      errorMessage = e.message;
      notifyListeners();
      return false;
    }
  }
}
