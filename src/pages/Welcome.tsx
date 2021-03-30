import { IonButton, IonContent, IonHeader, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, IonTabs, IonImg, IonInput, IonPage, IonText, IonTitle, IonToolbar, useIonViewWillEnter, IonTab, IonRouterOutlet, IonRouterLink, useIonViewDidEnter, useIonViewDidLeave, useIonViewWillLeave, IonCard, IonCardHeader, IonCardContent, IonCardSubtitle, IonThumbnail, IonCardTitle, IonItem, IonCol, IonLoading } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router'
import { useState } from 'react';
import { Route, useHistory } from 'react-router';
import storage from '../helpers/storage'
const { users, fStorage, cases } = require('../helpers/firebase.ts')

interface PropsInterface {
  messages: Array<string>
}

const Welcome: React.FC = () => {
  const history = useHistory()
  const [ messageNotifikasi, setMessageNotifikasi ] = useState([])
  const [ casesView, setCasesView ] = useState([])
  const [ loading, setLoading ] = useState(false)
  const [ authorized, setAuthorized ] = useState(false)

  useIonViewDidEnter(async () => {
    const messages = await storage.get('messages')
    if (messageNotifikasi && messages) setMessageNotifikasi(messages)
  })

  useIonViewWillLeave(async () => {
    await storage.remove('messages')
  })

  useIonViewWillEnter(async () => {
    await storage.create()
    const data = await storage.get('user')
    if (!Boolean(data)) history.push('/login')
    else {
      const temp: any = []
      
      let dataCases
      if (data.isAdmin) dataCases = await cases.get()
      else dataCases = await cases.where('userEmail', '==', data.email).get()
      if (!dataCases.empty) {
        dataCases.forEach((el: any) => {
          const authorized = data.email === el.userEmail ? true : false
          temp.push({ ...el.data(), id: el.id, authorized })
        })
      }
      setCasesView(temp)
    }
  })

  async function deleteCase(id: string) {
    setLoading(true)
    await cases.doc(id).delete()
    casesView.forEach((el: any, index: number) => {
      if (el.id === id) casesView.splice(index, 1)
    })
    setCasesView(casesView)
    setLoading(false)
  }

  async function logout() {
    await storage.remove('user')
    history.push('/login')
  }

  return (
    <IonPage>
      <IonLoading
        isOpen={loading}
        message={'Deleting...'}
        spinner='dots'
      />
      <IonHeader>
        <IonToolbar className="">
          <div className='justify-content-between d-flex' >
            <IonTitle>
              Cases Report
            </IonTitle>

            <div className="" style={{ width: 40}} onClick={logout}>
              <IonIcon size='large' src='./assets/logout.svg' color='danger' className='' />
            </div>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent>
      {casesView.length > 0 && casesView.map((el: any) => (
          <IonCard key={el.id} className='d-flex py-2 shadow'>
            <IonThumbnail style={{ size: 'large' }} className='h-auto w-25 col-4'>
              <IonImg src={el.photo} ></IonImg>
            </IonThumbnail>
            <IonCol className='d-flex flex-column justify-content-around col-6'>
              <IonCardTitle>{el.name} </IonCardTitle>
              <IonCardSubtitle>Age: {el.age} </IonCardSubtitle>
              <IonCardSubtitle>Adress: {el.address} </IonCardSubtitle>
              <IonCardSubtitle>Gender: {el.gender} </IonCardSubtitle>
              <IonCardSubtitle>Location: {el.detailLoc?.county}, {el.detailLoc?.region}, {el.detailLoc?.country} </IonCardSubtitle>
            </IonCol>
            {el.authorized &&
            <IonCol className='col-2 d-flex flex-column justify-content-around align-items-end'>
              <IonIcon size='large' src='./assets/hapus.svg' style={{ height: 60, color: 'red' }} className='' onClick={_=> deleteCase(el.id)} />
              <IonIcon onClick={_=> history.replace({ pathname: '/home/addcase', state: { el }})} size='large' src='./assets/edit.svg' color='primary' style={{ height: 60 }} className='' />
            </IonCol>}
          </IonCard>
      ))}
      </IonContent>
    </IonPage>
  );
};

export default Welcome;
