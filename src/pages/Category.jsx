import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from "../components/Spinner"

function Category() {

  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = useParams()

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsReference = collection(db, 'listings');

        const listingsQuery = query(
          listingsReference,
          where('type', '==', params.categoryName),
          orderBy('publishedAt', 'desc'),
          limit(10)
        );

        const querySnapshot = await getDocs(listingsQuery);

        const listingsData = []

        querySnapshot.forEach((document) => {
          return listingsData.push({
            id: document.id,
            data: document.data(),
          })
        })
        console.log(listingsData)

        setListings(listingsData);
        setLoading(false)
      } catch (error) {
        toast.error(error.message)
      }
    }

    fetchListings()
  }, [params.categoryName])

  return (
    <div className="category">
      <header>
        <p className="pageHeader">
          {
            params.categoryName === 'rent'
              ? 'Places for rent'
              : 'Places for sale'
          }
        </p>
      </header>
      {loading
        ? <Spinner />
        : listings && listings.length > 0
          ? <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing)=>(
                <h3 key={listing.id}>{listing.data.name}</h3>
              ))}
            </ul>
          </main>
          </>
          : <p>No listings for {params.categoryName}</p>
      }
    </div>
  )
}

export default Category