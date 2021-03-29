import { IonButton, IonContent, IonItem, IonLoading, IonRow, IonHeader, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, IonTabs, IonImg, IonInput, IonPage, IonText, IonTitle, IonToolbar, useIonViewWillEnter, IonTab, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router'
import ExploreContainer from '../components/ExploreContainer';
import firebase from 'firebase'
import { Route, useHistory } from 'react-router';
import { Geolocation } from '@ionic-native/geolocation'
import { Camera, CameraOptions } from '@ionic-native/camera'
import storage from '../helpers/storage'
import { useState } from 'react';
const { users, fStorage, cases } = require('../helpers/firebase.ts')


const AddCase: React.FC = () => {
  const [ loading, setLoading ] = useState(false)
  const [ uploading, setUploading ] = useState(false)
  // const [ progress, setProgress ] = useState(0)
  const [ hasil, setHasil ] = useState('hasil')
  const history = useHistory()
  const [ input, setInput ] = useState({
    name: '',
    address: '',
    age: undefined,
    photo: '',
    gender: '',
    location: '',
    photos: '',
    detailLoc: {},
  })

  useIonViewWillEnter(async () => {
    await storage.create()
    const data = await storage.get('user')
    if (!Boolean(data)) history.push('/login')
  })

  function handleInput(e: any) {
    setInput({ ...input, [e.target.id]: e.target.value})
  }

  async function getLoc() {
    setLoading(true)
    const { coords } = await Geolocation.getCurrentPosition()
    const url = 'http://api.positionstack.com/v1/reverse?access_key=0b8eea17816312e1c2d2a00486ae196a&output=json&limit=1&query=' + coords.latitude + ',' + coords.longitude

    const data = await fetch(url)
      .then(response => response.json())
    setInput({...input, detailLoc: data.data[0], location: `${coords.latitude},${coords.longitude}` })
    setLoading(false)
  }

  async function upload(e: any) {
    setUploading(true)
    const { email } = await storage.get('user')

    const options: CameraOptions = {
      quality: 100,
      destinationType: Camera.DestinationType.DATA_URL,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      sourceType: Camera.PictureSourceType.CAMERA
    }
    if (e.target.id === 'gallery') options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY
    
    const data = await Camera.getPicture(options)
    const captureDataUrl = 'data:image/jpeg;base64,' + data;

    let url = fStorage(new Date().toISOString() + '.jpg').putString(captureDataUrl, firebase.storage.StringFormat.DATA_URL)
    url.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      (snapshot: any) => {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        // setProgress(progress)
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            setUploading(false)
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, 
      (error: any) => {
        setUploading(false)
        
        switch (error.code) {
          case 'storage/unauthorized':
            break;
          case 'storage/canceled':
            break;
          case 'storage/unknown':
            break;
        }
      },
      () => {
        url.snapshot.ref.getDownloadURL()
          .then((downloadURL: any) => {
            console.log('File available at', downloadURL);
            setHasil(JSON.stringify(downloadURL, null, 2))
            return cases.add({...input, photos: downloadURL, userEmail: email })  
          })
          .then((data: any) => {
            console.log(data);
            console.log('done men');
            setUploading(false)
          })
          ;
      }
      )
  }

  return (
    <IonPage>
      <IonContent fullscreen>
          <IonTitle
          style={{ textAlign: 'center' }}
          size="large" className=''>AddCase</IonTitle>
          <div className='d-flex justify-content-center align-items-center h-100'>
            <div>
              <form >
                <IonItem>
                  <IonLabel position="stacked">Name</IonLabel>
                  <IonInput type='text' required id='name' value={input.name} onIonChange={handleInput} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Address</IonLabel>
                  <IonInput type='text' required id='address' value={input.address} onIonChange={handleInput} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Age</IonLabel>
                  <IonInput type='number' required id='age' value={input.age} onIonChange={handleInput} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Gender</IonLabel>
                  <IonInput type='text' required id='gender' value={input.gender} onIonChange={handleInput} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Location</IonLabel>
                  <IonInput placeholder='40.7638435,-73.9729691' type='text' required id='location' value={input.location} onIonChange={handleInput} />
                  <IonIcon color='primary' className='ion-align-self-center' slot='end' src='./assets/location.svg' onClick={getLoc}/>
                </IonItem>
                <div>
                  <IonButton type='submit' onClick={upload} id='camera' className='w-100'>Submit with camera</IonButton>
                </div>
                <div className='d-flex'>
                  <IonText className='text-center w-100'>or</IonText>
                </div>
                <div>
                  <IonButton type='submit' onClick={upload} id='gallery' className='w-100'>Submit with gallery</IonButton>
                </div>
              </form>
            </div>
          </div>
          <IonLoading
            isOpen={loading}
            message={'Loading'}
            spinner='lines'
          />
          <IonLoading
            isOpen={uploading}
            message={'Uploading!'}
            spinner='bubbles'
          />
      </IonContent>
    </IonPage>
  );
};

export default AddCase;
