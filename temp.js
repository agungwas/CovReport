if (Boolean(data) && data.isAdmin) {
  console.log('Initializing HomePage');

  // Request permission to use push notifications
  // iOS will prompt user and return if they granted permission or not
  // Android will just grant without prompting
  // PushNotifications.requestPermission().then( result => {
  //   if (result.granted) {
  //     // Register with Apple / Google to receive push via APNS/FCM
  //     PushNotifications.register();
  //   } else {
  //     // Show some error
  //   }
  // });

  // // On success, we should be able to receive notifications
  // PushNotifications.addListener('registration',
  //   async (token: PushNotificationToken) => {
  //     // alert('Push registration success, token: ' + token.value);
  //     await tokenFirebase.add({ token: token.value })
  //     console.log('Push registration success, token: ' + token.value);
  //   }
  // );

  // // Some issue with our setup and push will not work
  // PushNotifications.addListener('registrationError',
  //   (error: any) => {
  //     // alert('Error on registration: ' + JSON.stringify(error));
  //     console.log('Error on registration: ' + JSON.stringify(error));
  //   }
  // );

  // Show us the notification payload if the app is open on our device
  // PushNotifications.addListener('pushNotificationReceived',
  //   (notification: PushNotification) => {
  //     // alert('Push received: ' + JSON.stringify(notification));
  //     console.log('Push received: ' + JSON.stringify(notification));
  //     notification.
  //   }
  // );

  // // Method called when tapping on a notification
  // PushNotifications.addListener('pushNotificationActionPerformed',
  //   (notification: PushNotificationActionPerformed) => {
  //     // alert('Push action performed: ' + JSON.stringify(notification));
  //     console.log('Push action performed: ' + JSON.stringify(notification));
  //   }
  // );

}