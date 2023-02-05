import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'
import Spinner from "../components/Spinner"
import shareIcon from '../assets/svg/shareIcon.svg'
import { toast } from "react-toastify"



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

  if (loading) {
    return <Spinner />
  }
  return (
    <main>

      <div className="shareIconDiv" onClick={() => {
        navigator.clipboard.writeText(window.location.href)
        setIsShareLinkCopied(true)
        setTimeout(() => {
          setIsShareLinkCopied(false)
        }, 2000)
      }}>
        <img src={shareIcon} alt="" />
      </div>

      {isShareLinkCopied && <p className="linkCopied">Link Copied</p>}
      <div className="listingDetails">
        <p className="listingName">
          {listing.name} - ${Listing.isOffer
            ? listing.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        </p>
        <p className="listingLocation">{`${listing.location}, ${listing.country}`}</p>
        <p className="listingType">For {listing.type === 'rent' ? 'Rent' : 'Sale'}</p>
        {listing.isOffer && (
          <p className="discountPrice">
            ${listing.regularPrice - listing.discountedPrice} discount
          </p>
        )}

        <ul className="listingDetailsList">
          <li>
            {
            listing.bedrooms > 1 
            ? `${listing.bedrooms} Bedrooms` 
            : `1 Bedroom`
            }
          </li>
          <li>
            {
            listing.bathrooms > 1 
                ? `${listing.bathrooms} Bathrooms` 
                : `1 Bathroom`
            }
          </li>
          <li>{listing.parking && 'Parking Spot'}</li>
          <li>{listing.furnished && 'Furnished'}</li>
        </ul>
        <p className="listingLocationTitle">Location</p>

        {auth.currentUser?.uid !== listing.userRef && (
          <Link 
          to={`/contact/${listing.userRef}?name=${listing.name}`} className='primaryButton'>Contact Landlord</Link>
        )}
      </div>
    </main>
  )
}

export default Listing