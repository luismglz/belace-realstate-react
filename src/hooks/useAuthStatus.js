import { useEffect, useState, useRef } from "react"
import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const useAuthStatus = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [checkingStatus, setCheckingStatus] = useState(true);

  //for memery leaks
  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsLoggedIn(true);
        }
        setCheckingStatus(false);
      })
    }

    return () => {
      isMounted.current = false;
    }
  }, [isMounted])


  return { isLoggedIn, checkingStatus }
}
