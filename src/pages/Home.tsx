import { IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, IonTabs, useIonViewWillEnter, IonRouterOutlet, useIonViewDidEnter } from '@ionic/react';
import { Redirect, Route, useHistory, useParams } from 'react-router';
import storage from '../helpers/storage'
import Welcome from '../pages/Welcome'
import AddCase from '../pages/AddCase'
import Summary from '../pages/Summary'
import { useEffect, useState } from 'react';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
} from '@capacitor/core';
const { PushNotifications } = Plugins;


const Home: React.FC = () => {
  const [ countNewCase, setCountNewCase ] = useState(0)
  const [ isAdmin, setIsAdmin ] = useState(false)
  const history = useHistory() 
  const params = useParams()

  useEffect(() => {
    setCountNewCase(0)
    refreshBadge()
      .then(_=> console.log('dari useEffect home'))
      .catch(_=> console.log('dari useEffect home'))
  }, [params])

  const refreshBadge = async () => {

    PushNotifications.addListener('pushNotificationReceived',
      async (notification: PushNotification) => {
        console.log(JSON.stringify(notification.data, null));
        
        await refreshNotif(notification.data.messages)
      }
    );

    PushNotifications.addListener('pushNotificationActionPerformed',
      async (notification: PushNotificationActionPerformed) => {
        await refreshNotif(notification.notification.data.messages)
        history.replace('/home/welcome')
      }
    );    
  }

  async function refreshNotif(notification: any) {
    await storage.create()
    let messages = await storage.get('messages')
    if (!messages) messages = []
    messages.push(notification)
    await storage.set('messages', messages)
    // console.log('Push ACTION performed: ' + JSON.stringify(notification), 'dari ACTION di login');
    setCountNewCase(messages?.length)
  }

  useIonViewDidEnter(refreshBadge)
  
  useIonViewWillEnter(async () => {
    await storage.create()
    const data = await storage.get('user')
    if (Boolean(data) && data.isAdmin) setIsAdmin(true)
    if (!Boolean(data)) history.push('/login')
  })

  return (
        <IonTabs>
            <IonRouterOutlet>
              <Route path="/home/welcome" >
                <Welcome />
              </Route>
              <Route path="/home/addcase">
                <AddCase />
              </Route>
              <Route path="/home/summary">
                <Summary />
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

            { isAdmin &&
              <IonTabButton tab="summary" href='/home/summary'>
                <IonIcon size='large' src='./assets/bar-chart-outline.svg' className='ion-align-self-center'/>
                <IonLabel>Summary</IonLabel>
              </IonTabButton>
            }
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
