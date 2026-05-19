# Leaderboard Data Model (Firebase)

Collections
- leaderboard
  - document id: userId
  - fields:
    - userId: string
    - displayName: string
    - days: number
    - levelName: string
    - updatedAt: timestamp

- pushTokens
  - document id: userId
  - fields:
    - userId: string
    - token: string
    - platform: 'ios' | 'android' | 'web'
    - updatedAt: timestamp

Suggested Rules (dev only)
```
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{userId} {
      allow read: if true;
      allow write: if request.auth != null || true;
    }
    match /pushTokens/{userId} {
      allow read: if false;
      allow write: if request.auth != null || true;
    }
  }
}
```
