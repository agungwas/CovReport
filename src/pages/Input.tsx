import { IonButton, IonContent, IonHeader, IonImg, IonInput, IonPage, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { useState } from 'react';
import firebase from 'firebase'
import { Camera, CameraOptions } from '@ionic-native/camera'
import { Geolocation } from '@ionic-native/geolocation'
import { useHistory } from 'react-router';
const { users, fStorage } = require('../helpers/firebase.ts')

const Home: React.FC = () => {
  const history = useHistory()
  const [ image, setImage ] = useState(null)
  const [ hasilCamera, setHasilCamera ] = useState('')
  const [ status, setStatus ] = useState(0)
  const [ location, setLocation ] = useState('')
  async function coba () {
  
    history.push('/login')
    // const data = await users.add({ name: 'dari react', location: 'indonesia' })
    // console.log(data.id, 'ini data');
    

    // const found = await users.where('location', '!=', 'jakarta' ).get()
    // if (found.empty) console.log('kosong bos');

    // found.forEach(async (el: any) => {
    //   console.log(el.id, el.data());
    //   await users.doc(el.id).delete()
    // })
    // const doc = await users.get()
      // doc.data()
    console.log('udah kelar');
    
  }

  function keState (e: any) {
    console.log((e.target.files[0]));
    console.log(image, 'sebelum');
    if (e.target.files[0]) {
      setImage(e.target.files[0])
      // setHasilCamera(e.target.files[0])
    } 
    console.log(image, 'sesudah');
  }

  async function uploadStorage() {
    console.log(image, 'dari dalam button');
    // @ts-ignore
    let url = fStorage(image.name).put(image)

    url.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      (snapshot: any) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setStatus(progress)
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, 
      (error: any) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;

          // ...

          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        url.snapshot.ref.getDownloadURL().then((downloadURL: any) => {
          console.log('File available at', downloadURL);
        });
      }
    )
  }

  const options: CameraOptions = {
    quality: 100,
    destinationType: Camera.DestinationType.FILE_URI,
    encodingType: Camera.EncodingType.JPEG,
    mediaType: Camera.MediaType.PICTURE,
    sourceType: Camera.PictureSourceType.CAMERA
  }

  async function openCamera() {
    const data = await Camera.getPicture(options)

    //sudah berhasil
    // const captureDataUrl = 'data:image/jpeg;base64,' + data;
    // // console.log(data)
    // let url = await fStorage('dari camera.jpg').putString(captureDataUrl, firebase.storage.StringFormat.DATA_URL)
    // setStatus(100)

    // setImage(data)
  }

  async function getLoc() {
    const { coords } = await Geolocation.getCurrentPosition()
    console.log(coords.latitude);
    console.log(coords.longitude);
    
    setLocation(JSON.stringify(coords, null, 2))

    const url = 'http://api.positionstack.com/v1/reverse?access_key=0b8eea17816312e1c2d2a00486ae196a&output=json&limit=1&query=' + coords.latitude + ',' + coords.longitude

    const data = await fetch(url)
      .then(response => response.json())

    setLocation(JSON.stringify(data.data[0], null, 2))
    console.log('selesai');

  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Input</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
          </IonToolbar>
            <IonTitle size="large">Input</IonTitle>
        </IonHeader>
        <IonButton onClick={coba} >coba lagi</IonButton>
        {/* <input type="file" onChange={keState}></input>
        <IonButton onClick={uploadStorage}>upload</IonButton>
        <IonText>progress upload : {status}</IonText>
        <IonTitle>susi</IonTitle>
        <IonButton onClick={openCamera} >Camera</IonButton>
        { hasilCamera }
        { hasilCamera &&
        (<img src={hasilCamera} />)} */}
        <IonButton onClick={getLoc} >Lokasi</IonButton>
        { location }
      </IonContent>
    </IonPage>
  );
};

export default Home;
