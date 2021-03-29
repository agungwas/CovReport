import { IonButton, IonContent, IonHeader, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, IonTabs, IonImg, IonInput, IonPage, IonText, IonTitle, IonToolbar, useIonViewWillEnter, IonTab, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router'
import { Route, useHistory } from 'react-router';
import storage from '../helpers/storage'

const Welcome: React.FC = () => {
  const history = useHistory()

  useIonViewWillEnter(async () => {
    await storage.create()
    const data = await storage.get('user')
    if (!Boolean(data)) history.push('/login')
  })

  console.log('sampai ke welcome');
  

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>welcome</IonTitle>
        </IonToolbar>
      </IonHeader>
      {/* <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Welcome</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer />
          <IonButton onClick={() => history.push('/login')}>ke splash</IonButton>
      </IonContent> */}
    </IonPage>
  );
};

export default Welcome;
