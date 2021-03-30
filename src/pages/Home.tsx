import { IonButton, IonContent, IonHeader, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, IonTabs, IonImg, IonInput, IonPage, IonText, IonTitle, IonToolbar, useIonViewWillEnter, IonTab, IonRouterOutlet, useIonViewDidEnter } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router'
import { Redirect, Route, useHistory, useParams } from 'react-router';
import storage from '../helpers/storage'
import Welcome from '../pages/Welcome'
import AddCase from '../pages/AddCase'
import { useEffect, useState } from 'react';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
} from '@capacitor/core';
const { PushNotifications } = Plugins;
const { users, fStorage, tokenFirebase } = require('../helpers/firebase.ts')


const Home: React.FC = () => {
  const [ countNewCase, setCountNewCase ] = useState(0)
  const [ messageNotification, setMessageNotification ] = useState([])
  const [ isAdmin, setIsAdmin ] = useState(false)
  const history = useHistory() 
  const params = useParams()

  useEffect(() => {
    refreshBadge()
      .then(_=> console.log('dari useEffect home'))
      .catch(_=> console.log('dari useEffect home'))
  }, [params])

  const refreshBadge = async () => {
    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      async (notification: PushNotification) => {
        let messages = await storage.get('messages')
        if (!messages) messages = []
        messages.push(notification.data.message)
        await storage.set('messages', messages)
        // alert('Push received: ' + JSON.stringify(notification));
        console.log('Push RECEIVED: ' + JSON.stringify(notification), 'dari received, di login')
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      async (notification: PushNotificationActionPerformed) => {
        let messages = await storage.get('messages')
        if (!messages) messages = []
        messages.push(notification.notification.data.message)
        await storage.set('messages', messages)
        // alert('Push action performed: ' + JSON.stringify(notification));
        console.log('Push ACTION performed: ' + JSON.stringify(notification), 'dari ACTION di login');
        history.replace('/home/addcase')
      }
    );
    const messages = await storage.get('messages')
    if (messages) {
      setCountNewCase(messages.length)
      setMessageNotification(messages)
    }
    
  }

  useIonViewDidEnter(refreshBadge)
  
  useIonViewWillEnter(async () => {
    await storage.create()
    const data = await storage.get('user')
    if (Boolean(data) && data.isAdmin) setIsAdmin(true)
    if (!Boolean(data)) history.push('/login')
  })

  return (
        <IonTabs onIonTabsDidChange={refreshBadge}>
            <IonRouterOutlet>
              <Route path="/home/welcome" >
                <Welcome />
              </Route>
              <Route path="/home/addcase">
                <AddCase />
              </Route>
              <Route exact path="/home">
                <Redirect to="/home/welcome" />
              </Route>
            </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="welcome" href='/home/welcome'>
              <IonIcon size='large' src='./assets/list.svg' className='ion-align-self-center'/>
              <IonLabel>Home</IonLabel>
              {
                countNewCase !== 0 &&
                <IonBadge>{countNewCase} </IonBadge>
              }
            </IonTabButton>

            { isAdmin === false &&
              <IonTabButton tab="Add case" href='/home/addcase'>
                <IonIcon size='large' src='./assets/add-circle-outline.svg' className='ion-align-self-center'/>
                <IonLabel>Add case</IonLabel>
              </IonTabButton>
            }

          </IonTabBar>
        </IonTabs>
  );
};

export default Home;
