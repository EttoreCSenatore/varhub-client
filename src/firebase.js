import { initializeApp } from 'firebase/app';  
import { getMessaging, getToken, onMessage } from 'firebase/messaging';  
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyDG06gxpvN1VIVlEJf4mc7GBxPZSFzeVnQ",
    authDomain: "varhub-9ce82.firebaseapp.com",
    projectId: "varhub-9ce82",
    storageBucket: "varhub-9ce82.firebasestorage.app",
    messagingSenderId: "66486907257",
    appId: "1:66486907257:web:7eb9718b1c9d049776ffa8",
    measurementId: "G-4BM2NVYQZH"
  };

const app = initializeApp(firebaseConfig); 
const analytics = getAnalytics(app); 
const messaging = getMessaging(app);  

export const requestNotificationPermission = async () => {  
  try {  
    await Notification.requestPermission();  
    const token = await getToken(messaging, { vapidKey: 'BHquMDolLd8-OwLxmGnSir0aPn4eeCHwArDPQ6XIWYUfpdOsgH_jmUIorRRw255KW4_C8A1Sc4PZT6lh8elzYuE' });  
    console.log('FCM Token:', token);  
    return token;  
  } catch (error) {  
    console.error('Error getting FCM token:', error);  
  }  
};  

export const onMessageListener = () =>  
  new Promise((resolve) => {  
    onMessage(messaging, (payload) => {  
      resolve(payload);  
    });  
  });  