# Changelog

All notable changes to BusKá will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0-beta] - 2026-03-14

### Added

- **Authentication** — Login, step-by-step registration with address fields, and password recovery
- **Role-based navigation** — Distinct flows for students (aluno), drivers (motorista), and managers (gestor)
- **Design system** — BusKá theme with design tokens, Inter font, and Material Icons across Android and web
- **Route management** — Managers can create routes, define stops with an interactive map, and assign drivers
- **Trip management** — Managers can schedule trips with departure times; drivers can start and end trips in real time
- **Bus location tracking** — Students can view their bus location live on an interactive Leaflet map
- **Driver geolocation** — Driver GPS coordinates are sent to the backend continuously during active trips
- **Student presence confirmation** — Students can confirm attendance for upcoming trips from their dashboard
- **Push notifications** — Firebase Cloud Messaging integration for trip and route updates
- **CEP auto-fill** — Address fields auto-populated from postal code lookup during registration
- **Toast notifications** — In-app feedback system for actions, errors, and async state changes
- **Error handling** — Field-level validation errors from the backend displayed inline in forms

### Removed

- Chat feature (descoped from this version)

### Infrastructure

- Self-hosted GitHub Actions runner for Android builds
- Automated signed APK generation with keystore managed via GitHub Secrets
- Separate workflows for debug builds (on push) and release builds (on `v*` tags)
- GitHub Release created automatically with APK attached on tag push
- Discord notifications for both build and release events
