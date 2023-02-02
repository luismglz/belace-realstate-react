import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'
import Spinner from "../components/Spinner"
import shareIcon from '../assets/svg/shareIcon.svg'
import { async } from "@firebase/util"



function Listing() {

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isShareLinkCopied, setIsShareLinkCopied] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const auth = getAuth();

  useEffect(() => {
    const fetchListing = async () => {
      const documentReference = doc(db, 'listings', params.listingId)
      const documentSnapshot = await getDoc(documentReference)

      if (documentSnapshot.exists()) {
        setListing(documentSnapshot.data())
        setLoading(false)
      }

    }

    fetchListing();

  }, [navigate, params.listingId])


  return (
    <div>Listing</div>
  )
}

export default Listing