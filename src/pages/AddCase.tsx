import { IonButton, IonContent, IonItem, IonLoading, IonIcon, IonLabel, IonImg, IonInput, IonPage, IonText, IonTitle, useIonViewWillEnter, useIonViewWillLeave, IonThumbnail, IonCard, IonSelect, IonSelectOption } from '@ionic/react';
import firebase from 'firebase'
import { useHistory } from 'react-router';
import { Geolocation } from '@ionic-native/geolocation'
import { Camera, CameraOptions } from '@ionic-native/camera'
import storage from '../helpers/storage'
import { useState } from 'react';
import { tokenFirebase } from '../helpers/firebase';
const { users, fStorage, cases } = require('../helpers/firebase.ts')


const AddCase: React.FC = () => {
  const [ loading, setLoading ] = useState(false)
  const [ uploading, setUploading ] = useState(false)
  const [ editStatus, setEditStatus ] = useState(false)
  const [ uploadByGallery, setUploadByGallery ] = useState('')
  const [ selected, setSelected ] = useState(null)
  const history = useHistory()
  const [ input, setInput ]: any = useState({
    name: '',
    address: '',
    age: undefined,
    photo: '',
    isMale: undefined,
    location: '',
    photos: '',
    detailLoc: {}
  })

  function handleInput(e: any) {
    if (e.target.id === 'isMale') setSelected(e.target.value)
    setInput({ ...input, [e.target.id]: e.target.value}) 
  }

  function clearInput() {
    setSelected(null)
    setInput({ name: '', address: '', age: undefined, photo: '', isMale: undefined, location: '', photos: '', detailLoc: {} })
    setUploadByGallery('')
  }

  useIonViewWillLeave(clearInput)

  useIonViewWillEnter(async () => {
    await storage.create()
    const data = await storage.get('user')
    if (!Boolean(data)) history.push('/login')
    
    if (history.location.state) {
      setEditStatus(true)
      // @ts-ignore
      const editData = history.location.state.el
      setInput({ ...editData })
      setSelected(editData.isMale)
    } else setEditStatus(false)
  })

  async function getLoc() {
    setLoading(true)
    const { coords } = await Geolocation.getCurrentPosition()
    const url = 'http://api.positionstack.com/v1/reverse?access_key=0b8eea17816312e1c2d2a00486ae196a&output=json&limit=1&query=' + coords.latitude + ',' + coords.longitude

    const data = await fetch(url)
      .then(response => response.json())
    setInput({...input, detailLoc: data.data[0], location: `${coords.latitude},${coords.longitude}` })
    setLoading(false)
  }

  async function upload(mode: string) {
    const options: CameraOptions = {
      quality: 100,
      destinationType: Camera.DestinationType.DATA_URL,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      sourceType: Camera.PictureSourceType.CAMERA
    }
    if (mode === 'gallery') options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY
    
    const data = await Camera.getPicture(options)
    const captureDataUrl = 'data:image/jpeg;base64,' + data;
    setUploadByGallery(captureDataUrl)
  }
  
  async function uploadGambar(e: any) {
    e.preventDefault()
    setUploading(true)
    const { email, name } = await storage.get('user')

    let url = fStorage(new Date().toISOString() + '.jpg').putString(uploadByGallery, firebase.storage.StringFormat.DATA_URL)
    url.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      (snapshot: any) => {
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
      async () => {
        const downloadURL: string = await url.snapshot.ref.getDownloadURL()
        if (editStatus) {
          const id = input.id
          delete input.id
          delete input.authorized
          await cases.doc(id).set({ ...input, photo: downloadURL })
        } 
        else {
          await cases.add({...input, photo: downloadURL, userEmail: email })
        } 
        await firingNotif(name)
      }
    )
  }

  async function firingNotif(name: string) {

    const registrationToken: any[] = [];
    const tokenAdmin = await tokenFirebase.get()
    if (!tokenAdmin.empty) {
      tokenAdmin.forEach((datum: any) => {
        registrationToken.push(datum.data().token)
      })
    }
    
    const body = JSON.stringify({
      registration_ids: registrationToken,
      data: {
        message: `user "${name}" has reported new Covid-19’s cases`
      },
      notification:{
        title: "New case reported!",
        body: `user "${name}" has reported new Covid-19’s cases`
      },
      collapse_key: "Updates Available",
      time_to_live: 86400
    })
    await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=AAAAdc8Ztpg:APA91bHJ431aOXIEwLnTancpWlLHEM8IS0EU46FV8LZuWG6hh1dYsvMk17uMq7NsDq0vFbw9VjIZ0BNV_Sb-npyQZA8rOs8Gnrt1x-spFSJnTLOz-CDCNJpyaLR2Rua3MpkDcc2-Swyz`,
      },
      body,
    })
    
    clearInput()
    setUploading(false)
    history.replace('/home/welcome')
  }

  async function commitEdit(e: any) {     
    e.preventDefault() 
    if (!uploadByGallery && editStatus) {
      setUploading(true)
      const { email, name } = await storage.get('user')
      
      const id = input.id
      delete input.id
      delete input.authorized

      await cases.doc(id).set(input)
      
      await firingNotif(name)
    } else { await uploadGambar(e) }
  }

  return (
    <IonPage>
      <IonContent fullscreen>
          <div className='d-flex justify-content-center align-items-center h-100'>
            <div>
              <form onSubmit={editStatus ? commitEdit : uploadGambar}>
                <IonTitle
                style={{ textAlign: 'center' }}
                size="large" className=''> { editStatus ? 'Edit Case' : 'Report New Case'}
                </IonTitle>
                <IonItem>
                  <IonLabel position="stacked">Name</IonLabel>
                  <IonInput type='text' minlength={3} required id='name' value={input.name} onIonChange={handleInput} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Address</IonLabel>
                  <IonInput type='text' minlength={3} required id='address' value={input.address} onIonChange={handleInput} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Age</IonLabel>
                  <IonInput type='number' min='1' required id='age' value={input.age} onIonChange={handleInput} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Gender</IonLabel>
                  <IonSelect value={selected} placeholder="Select One" id='isMale' onIonChange={handleInput}>
                    <IonSelectOption value={false}>Female</IonSelectOption>
                    <IonSelectOption value={true}>Male</IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Location</IonLabel>
                  <IonInput placeholder='ie. 40.7638435,-73.9729691' minlength={10} type='text' required id='location' value={input.location} onIonChange={handleInput} />
                  <IonIcon color='primary' className='ion-align-self-center' slot='end' src='./assets/location.svg' onClick={getLoc}/>
                </IonItem>
                {editStatus && (
                  <IonCard className='d-flex py-2 shadow justify-content-center '>
                    <IonThumbnail style={{ size: 'large' }} className='h-auto w-25 col-4'>
                      <IonImg src={input.photo} style={{ flex:1 }} ></IonImg>
                    </IonThumbnail>
                    <div className='d-flex flex-column justify-content-between'>
                      <IonIcon size='large' color='primary' src='./assets/image-outline.svg' onClick={_=> upload('gallery')}>from gallery</IonIcon>
                      <IonIcon size='large' color='primary' src='./assets/camera-outline.svg' onClick={_=> upload('camera')}>from camera</IonIcon>
                    </div>
                  </IonCard>
                )}
                {!editStatus && (
                  <div className='d-flex justify-content-around mt-3'>
                    <IonIcon size='large' color='primary' src='./assets/camera-outline.svg' onClick={_=> upload('camera')}>from camera</IonIcon>
                    <IonText className='text-center align-self-center'>or</IonText>
                    <IonIcon size='large' color='primary' src='./assets/image-outline.svg' onClick={_=> upload('gallery')}>from gallery</IonIcon>
                  </div>
                )}
                <div className='d-flex justify-content-center mt-3'>
                  <IonButton type='submit' >{ editStatus ? 'edit' : 'submit'}</IonButton>
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
