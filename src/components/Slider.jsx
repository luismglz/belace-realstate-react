import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase.config'
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.css'
import Spinner from "./Spinner"


SwiperCore.use([Navigation, Pagination, Scrollbar, A11y])


function Slider() {


  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {

    const fetchListings = async () => {
      const listingsReference = collection(db, 'listings');
      const listingsQuery = query(listingsReference, orderBy('publishedAt', 'desc'), limit(5))
      const querySnapshot = await getDocs(listingsQuery);

      let listings = []

      querySnapshot.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data()
        })
      })

      setListings(listings);
      setLoading(false)
    }

    fetchListings()



  }, [])

  if(listings.length === 0){
    return <></>
  }


  if (loading) {
    return <Spinner />
  }


  return listings && (
    <>
      <p className="exploreHeading">
        Recommended
      </p>
      <Swiper slidesPerView={1} pagination={{ clickable: true }}>
        {
          listings.map(({ data, id }) => (
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/category/${data.type}/${id}`)}>
              <div
                style={{
                  background: `url(${data.imgUrls[0]}) center no-repeat`,
                  backgroundSize: 'cover'
                }}
                className="swiperSlideDiv">
                <p className="swiperSlideText">{data.name}</p>
                <p className="swiperSlidePrice">
                  ${data.discountedPrice ?? data.regularPrice}
                  {' '}
                  {data.type === 'rent' && '/ month'}
                </p>

              </div>

            </SwiperSlide>
          ))
        }
      </Swiper>
    </>
  )
}

export default Slider