import firebase from 'firebase'
  // Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAxAmZCwggAFqxNK3H-QEVTOwOVYBFNiFw",
  authDomain: "serverionicagung.firebaseapp.com",
  projectId: "serverionicagung",
  storageBucket: "serverionicagung.appspot.com",
  messagingSenderId: "505985742488",
  appId: "1:505985742488:web:c3b936f5c5a209c116c2ed"
};
  // Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore()
const fStorage = function (nama: String) {
  return firebase.storage().ref().child(`covidapp/${nama}`)
} 
const users = db.collection('users')
const cases = db.collection('cases')

// module.exports = { admin, member }
// export admin
// export default member
export { users, fStorage, cases }