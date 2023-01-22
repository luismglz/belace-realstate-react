import { useLocation, useNavigate } from "react-router-dom"
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import googleIcon from '../assets/svg/googleIcon.svg'


function OAuth() {

  const navigate = useNavigate();

  const location = useLocation();

  const onGoogleClick = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider);
      const user = result.user

      //check if user exist in firestore
      const docRef = doc(db, 'users', user.uid);
      const documentSnapshot = await getDoc(docRef);

      if (!documentSnapshot.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          fullname: user.displayName,
          email: user.email,
          createdAt: serverTimestamp(),
        })
      }

      navigate('/')

    } catch (error) {
      toast.error(error.message)
    }
  }


  return (
    <div className="socialLogin">
      <p>
        Sign {location.pathname === '/sign-up' ? 'Up' : 'In'} with
      </p>
      <button className="socialIconDiv" onClick={onGoogleClick}>
        <img className="socialIconImg" src={googleIcon} alt="google" />
      </button>

    </div>
  )
}

export default OAuth