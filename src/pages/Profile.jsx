import { getAuth, updateProfile } from "firebase/auth"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'

function Profile() {

  const auth = getAuth();

  const [changeDetails, setChangeDetails] = useState(false);



  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    fullname: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })

  const { fullname, email } = formData;

  const onLogout = () => {
    auth.signOut();
    navigate('/');
  }

  const onSubmit = async () => {
    try {

      //update display name in firebase auth
      if (auth.currentUser.displayName !== fullname) {
        await updateProfile(auth.currentUser, {
          displayName: fullname
        });

        const userDocReference = doc(db, 'users', auth.currentUser.uid);

        await updateDoc(userDocReference, {
          fullname
        })

        toast.success('Info successfully updated')
      }
    } catch (error) {
      toast.error(error.message)

    }
  }

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value
    }))
  }



  return <div className="profile">
    <header className="profileHeader">
      <p className="pageHeader">Profile</p>
      <button className="logOut" type="button" onClick={onLogout}>Log Out</button>
    </header>
    <main>
      <div className="profileDetailsHeader">
        <p className="profileDetailsText">User details</p>
        <p className="changePersonalDetails" onClick={() => {
          changeDetails && onSubmit()
          setChangeDetails((prevState) => !prevState)

        }}>
          {changeDetails ? 'done' : 'change'}
        </p>
      </div>
      <div className="profileCard">
        <form>
          <input
            type="text"
            id="fullname"
            className={!changeDetails ? 'profileName' : 'profileNameActive'}
            disabled={!changeDetails}
            value={fullname}
            onChange={onChange}
          />
          <input
            type="email"
            id="email"
            className={!changeDetails ? 'profileEmail' : 'profileEmail'}
            disabled={!changeDetails}
            value={email}
            onChange={onChange}
          />
        </form>
      </div>
      <Link to="/create-listing" className="createListing">
        <img src={homeIcon} alt="home" />
        <p>Sell or rent your home</p>
        <img src={arrowRight} alt="arrow right" />
      </Link>
    </main>
  </div>
}

export default Profile