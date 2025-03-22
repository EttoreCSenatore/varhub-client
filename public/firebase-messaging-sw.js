// Firebase Cloud Messaging Service Worker

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDG06gxpvN1VIVlEJf4mc7GBxPZSFzeVnQ",
  authDomain: "varhub-9ce82.firebaseapp.com",
  projectId: "varhub-9ce82",
  storageBucket: "varhub-9ce82.firebasestorage.app",
  messagingSenderId: "66486907257",
  appId: "1:66486907257:web:7eb9718b1c9d049776ffa8",
  measurementId: "G-4BM2NVYQZH"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}); 