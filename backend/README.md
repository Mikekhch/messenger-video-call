# Real-Time Messenger Backend Architecture

This directory contains the Firebase backend setup for the Real-time Messenger App.

## Directory Structure
- `firebase.json`: Main Firebase configuration file mapping firestore, storage, and cloud functions.
- `firestore.rules`: Security rules for Firestore collections (`users`, `chats`, `messages`, `calls`).
- `firestore.indexes.json`: Query index configurations for fast message and chat history querying.
- `storage.rules`: Firebase Storage security rules for user avatars and chat media files.
- `functions/`: Cloud Functions directory containing FCM push notification triggers for messages and WebRTC calls.

## Deployment via Firebase CLI
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```bash
   firebase login
   ```
3. Initialize or link your Firebase project:
   ```bash
   firebase use --add
   ```
4. Deploy Rules and Cloud Functions:
   ```bash
   firebase deploy --only firestore,storage,functions
   ```

## Setup in Project IDX
In Google Project IDX, open the terminal in the root or `backend` folder and run `firebase deploy` after authenticating with `firebase login`.
