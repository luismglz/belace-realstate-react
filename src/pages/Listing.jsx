import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'
import Spinner from "../components/Spinner"
import shareIcon from '../assets/svg/shareIcon.svg'
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.css'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { toast } from "react-toastify"

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y])



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

      <Swiper
        slidesPerView={1}
        pagination={{ clickable: true }}>
        {listing.imgUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div style={{
              background: `url(${listing.imgUrls[index]}) center no-repeat`,
              backgroundSize: 'cover'

            }} className="swiperSlideDiv">

            </div>
          </SwiperSlide>
        ))}
      </Swiper>

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
            ? listing?.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            : listing?.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        </p>
        <p className="listingLocation">{`${listing.location}, ${listing.country}`}</p>
        <p className="listingType">For {listing.type === 'rent' ? 'Rent' : 'Sale'}</p>
        {listing.isOffer && (
          <p className="discountPrice">
            ${listing.regularPrice - listing.discountedPrice} with discount
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
        <div className="leafletContainer">
          <MapContainer
            style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={11}
            scrollWheelZoom={false}>
            <TileLayer
              attribution=''
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

            />
            <Marker position={[listing.geolocation.lat, listing.geolocation.lng]}>
              <Popup>{listing.address}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?name=${listing.name}`} className='primaryButton'>Contact Landlord</Link>
        )}
      </div>
    </main>
  )
}

export default Listing