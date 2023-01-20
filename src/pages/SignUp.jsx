import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {toast} from 'react-toastify'
import {getAuth, createUserWithEmailAndPassword, updateProfile} from  'firebase/auth';
import {setDoc, doc, serverTimestamp} from 'firebase/firestore'
import {db} from '../firebase.config';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'


function SignUp() {

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: ''
  })
  

  const { fullname, email, password } = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      updateProfile(auth.currentUser,{
        displayName: fullname,
      })

      //setup data before add into db
      const formDataCopy = {...formData}
      delete formDataCopy.password
      formDataCopy.createdAt = serverTimestamp()


      await setDoc(doc(db, 'users', user.uid), formDataCopy)
      console.log(formDataCopy)



      navigate('/')


    } catch (error) {
      toast.error(error.message)
      console.log(error.message)
    }
  }

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">
            Create an account
          </p>
        </header>
        <form onSubmit={onSubmit}>
          <input
            name="fullname"
            type="text"
            className="nameInput"
            placeholder="Enter your fullname"
            id="fullname" value={fullname}
            onChange={onChange}
          />
          <input
            name="email"
            type="text"
            className="emailInput"
            placeholder="Enter your email"
            id="email" value={email}
            onChange={onChange}
          />
          <div className="passwordInputDiv">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className='passwordInput'
              placeholder="Enter your password"
              value={password}
              onChange={onChange}
            />
            <img
              src={visibilityIcon}
              alt="show password icon"
              className="showPassword"
              onClick={() => setShowPassword((prevState) => !prevState)}
            />
            <Link
              to='/forgot-password'
              className="forgotPasswordLink"
            >
              Forgot Password
            </Link>
            <div className="signUpBar">
              <p className="signUpText">
                Sign Up
              </p>
              <button className="signUpButton">
                <ArrowRightIcon fill='#ffffff' width="34px" height="34px" />
              </button>
            </div>
          </div>
        </form>
        <div className="signUpInsteadBar">
          <p>Already have an account?&nbsp;</p>
          <Link
            to='/sign-in'
            className="signUpLink">Sign In
          </Link>
        </div>
      </div>
    </>
  )
}

export default SignUp