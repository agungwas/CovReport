import firebase from 'firebase'
// import 'firebase/firebase-storage'
// import 'firebase/firebase-firestore'

var firebaseConfig = {
  apiKey: "AIzaSyAxAmZCwggAFqxNK3H-QEVTOwOVYBFNiFw",
  authDomain: "serverionicagung.firebaseapp.com",
  projectId: "serverionicagung",
  storageBucket: "serverionicagung.appspot.com",
  messagingSenderId: "505985742488",
  appId: "1:505985742488:web:c3b936f5c5a209c116c2ed"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore()
const fStorage = function (nama: String) {
  return firebase.storage().ref().child(`covidapp/${nama}`)
} 
const users = db.collection('users')
const cases = db.collection('cases')
const tokenFirebase = db.collection('token')

export { users, fStorage, cases, tokenFirebase }