import { getAuth } from "firebase/auth"
import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"

function Profile() {
  
  const auth = getAuth();
  const navigate = useNavigate();


 const [formData, setFormData] = useState({
  fullname: auth.currentUser.displayName,
  email: auth.currentUser.email,
 })

 const onLogout = () => {
  auth.signOut();
  navigate('/');
 }



  return <div className="profile">
    <header className="profileHeader">
      <p className="pageHeader">Profile</p>
      <button className="logOut" type="button" onClick={onLogout}>Log Out</button>
    </header>
  </div>
}

export default Profile