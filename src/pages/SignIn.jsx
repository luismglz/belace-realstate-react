import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'


function SignIn() {

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const { email, password } = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
   }

   const onSubmit = async(e)=> {
    e.preventDefault()
    try {
      const auth = getAuth()
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        console.log(userCredential);
        navigate('/')
      }
    } catch (error) {
      console.error(error)
    }
   }

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">
            Welcome Back!
          </p>
        </header>
        <form onSubmit={onSubmit}>
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
            <div className="signInBar">
              <p className="signInText">
                Sign In
              </p>
              <button className="signInButton">
                <ArrowRightIcon fill='#ffffff' width="34px" height="34px"/>
              </button>
            </div>
          </div>
        </form>
        <div className="signUpInsteadBar">
          <p>Don't have an account?&nbsp;</p>
          <Link
            to='/sign-up'
            className="signUpLink">Sign Up
          </Link>
        </div>
      </div>
    </>
  )
}

export default SignIn