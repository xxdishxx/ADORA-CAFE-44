import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'screens/home_screen.dart';
import 'screens/orders_screen.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const AdoraApp());
}

class AdoraApp extends StatelessWidget {
  const AdoraApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ADORA ☕',
      theme: ThemeData(
        primarySwatch: Colors.brown,
        useMaterial3: true,
      ),
      debugShowCheckedModeBanner: false,
      home: const LoginScreen(),
    );
  }
}