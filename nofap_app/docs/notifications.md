# Notifications MVP

This app uses Expo Notifications for local alerts and Expo push tokens for server sends.

- Local notifications: on-device reward/challenge alerts.
- Push tokens: stored in Firebase for future server-triggered pushes.

To send pushes, add a server or Firebase Cloud Function that calls the Expo push API using stored tokens.
