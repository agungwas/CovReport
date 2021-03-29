import { IonButton, IonContent, IonHeader, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, IonTabs, IonImg, IonInput, IonPage, IonText, IonTitle, IonToolbar, useIonViewWillEnter, IonTab, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router'
import { Redirect, Route, useHistory, useParams } from 'react-router';
import storage from '../helpers/storage'
import Welcome from '../pages/Welcome'
import AddCase from '../pages/AddCase'

const Home: React.FC = () => {
  const history = useHistory()
  
  useIonViewWillEnter(async () => {
    await storage.create()
    const data = await storage.get('user')
    if (!Boolean(data)) history.push('/login')
  })

  return (
      <IonReactRouter>
        <IonTabs>
            <IonRouterOutlet>
              <Route path="/home/welcome">
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
              {/* <IonIcon icon={calendar} /> */}
              <IonLabel>Home</IonLabel>
              <IonBadge>6</IonBadge>
            </IonTabButton>

            <IonTabButton tab="speakers">
              {/* <IonIcon icon={personCircle} /> */}
              <IonLabel>Speakers</IonLabel>
            </IonTabButton>

            <IonTabButton tab="map">
              {/* <IonIcon icon={map} /> */}
              <IonLabel>Map</IonLabel>
            </IonTabButton>

            <IonTabButton tab="Add case" href='/home/addcase'>
              <IonIcon size='large' src='./assets/add-circle-outline.svg' className='ion-align-self-center'/>
              <IonLabel>Add case</IonLabel>
            </IonTabButton>

          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
  );
};

export default Home;
