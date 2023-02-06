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
import ListingItem from "../components/ListingItem"
import Spinner from "../components/Spinner"

function Category() {

  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null)

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

        const lastVisibleDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastFetchedListing(lastVisibleDocument);

        const listingsData = []

        querySnapshot.forEach((document) => {
          return listingsData.push({
            id: document.id,
            data: document.data(),
          })
        })

        setListings(listingsData);
        setLoading(false)
      } catch (error) {
        toast.error(error.message)
      }
    }

    fetchListings()
  }, [params.categoryName])



  //Pagination / Load More
  const onFetchMoreListings = async () => {
    try {
      const listingsReference = collection(db, 'listings');

      const listingsQuery = query(
        listingsReference,
        where('type', '==', params.categoryName),
        orderBy('publishedAt', 'desc'),
        startAfter(lastFetchedListing),
        limit(10)
      );

      const querySnapshot = await getDocs(listingsQuery);

      const lastVisibleDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastFetchedListing(lastVisibleDocument);

      const listingsData = []

      querySnapshot.forEach((document) => {
        return listingsData.push({
          id: document.id,
          data: document.data(),
        })
      })

      setListings((prevState) => [...prevState, ...listings]);
      setLoading(false)
    } catch (error) {
      toast.error(error.message)
    }
  }


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
                {listings.map((listing) => (
                  <ListingItem
                    listing={listing.data}
                    id={listing.id}
                    key={listing.id}
                  />
                ))}
              </ul>
            </main>
            <br />
            <br />
            {
              lastFetchedListing && (
                <p className="loadMore" onClick={() => {
                  lastFetchedListing !== null ? onFetchMoreListings : toast.success('d')
                }}>Load More</p>
              )
            }
          </>
          : <p>No listings for {params.categoryName}</p>
      }
    </div>
  )
}

export default Category