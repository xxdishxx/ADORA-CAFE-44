const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
};

/**
 * Send push notification via FCM
 */
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) {
    console.warn('No FCM token provided');
    return;
  }

  try {
    initializeFirebase();

    const message = {
      notification: {
        title,
        body,
      },
      data,
      android: {
        priority: 'high',
        notification: {
          sound: 'adora_sound',
        },
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: {
            sound: 'adora_sound.caf',
            badge: 1,
          },
        },
      },
      token: fcmToken,
    };

    const response = await admin.messaging().send(message);
    console.log('Push notification sent:', response);
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

/**
 * Send notification on order created
 */
const notifyOrderCreated = async (user) => {
  await sendPushNotification(
    user.fcmToken,
    'ADORA ☕',
    'Your ADORA drink is waiting for confirmation',
    { orderId: 'pending', action: 'orderCreated' }
  );
};

/**
 * Send notification on order approved
 */
const notifyOrderApproved = async (user) => {
  await sendPushNotification(
    user.fcmToken,
    'ADORA ☕',
    'Your ADORA drink is now being prepared.',
    { action: 'orderApproved' }
  );
};

/**
 * Send notification on order ready
 */
const notifyOrderReady = async (user) => {
  await sendPushNotification(
    user.fcmToken,
    'ADORA ☕',
    'Your ADORA drink is ready for pickup 💛',
    { action: 'orderReady' }
  );
};

module.exports = {
  initializeFirebase,
  sendPushNotification,
  notifyOrderCreated,
  notifyOrderApproved,
  notifyOrderReady,
};