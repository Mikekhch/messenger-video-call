const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Triggers when a new message is added to a chat document in Firestore.
 * Sends an FCM push notification to all chat participants except the sender.
 */
exports.onNewMessage = functions.firestore
  .document("chats/{chatId}/messages/{messageId}")
  .onCreate(async (snapshot, context) => {
    const { chatId } = context.params;
    const message = snapshot.data();

    if (!message) return null;

    const senderId = message.senderId;
    const content = message.text || (message.type === "image" ? "📷 Sent an image" : "🎤 Voice note");

    try {
      // Get chat details to find participants
      const chatDoc = await admin.firestore().collection("chats").doc(chatId).get();
      if (!chatDoc.exists) return null;

      const chatData = chatDoc.data();
      const participants = chatData.participants || [];

      // Get sender's info for notification title
      const senderDoc = await admin.firestore().collection("users").doc(senderId).get();
      const senderName = senderDoc.exists ? senderDoc.data().displayName || "Someone" : "Someone";

      // Send push notification to recipients
      const notificationPromises = participants
        .filter((uid) => uid !== senderId)
        .map(async (recipientId) => {
          const userDoc = await admin.firestore().collection("users").doc(recipientId).get();
          if (!userDoc.exists) return;

          const userData = userDoc.data();
          const fcmToken = userData.fcmToken;

          if (!fcmToken) return;

          const payload = {
            token: fcmToken,
            notification: {
              title: senderName,
              body: content,
            },
            data: {
              click_action: "FLUTTER_NOTIFICATION_CLICK",
              chatId: chatId,
              type: "message",
            },
          };

          return admin.messaging().send(payload);
        });

      await Promise.all(notificationPromises);
      console.log(`Notification sent for message in chat ${chatId}`);
    } catch (error) {
      console.error("Error sending message notification:", error);
    }
  });

/**
 * Triggers when a new call document is created in Firestore.
 * Sends a call push notification to the recipient.
 */
exports.onCallCreated = functions.firestore
  .document("calls/{callId}")
  .onCreate(async (snapshot, context) => {
    const { callId } = context.params;
    const callData = snapshot.data();

    if (!callData) return null;

    const { callerId, receiverId, callType, callerName } = callData;

    try {
      const receiverDoc = await admin.firestore().collection("users").doc(receiverId).get();
      if (!receiverDoc.exists) return null;

      const fcmToken = receiverDoc.data().fcmToken;
      if (!fcmToken) return null;

      const payload = {
        token: fcmToken,
        notification: {
          title: `Incoming ${callType === "video" ? "Video" : "Voice"} Call`,
          body: `${callerName || "Someone"} is calling you...`,
        },
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          callId: callId,
          callerId: callerId,
          type: "call",
          callType: callType || "voice",
        },
      };

      await admin.messaging().send(payload);
      console.log(`Call notification sent for call ${callId} to ${receiverId}`);
    } catch (error) {
      console.error("Error sending call notification:", error);
    }
  });
