import { useState, useEffect, useRef } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db } from '../firebase.config'
import { serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { toast } from 'react-toastify'
import Spinner from "../components/Spinner";

function EditListing() {

  const countries = [
    "Belgium",
    "Canada",
    "Chile",
    "China",
    "Czech Republic",
    "Germany",
    "Hong Kong SAR",
    "India",
    "Indonesia",
    "Iran",
    "Israel",
    "Italy",
    "Japan",
    "Mexico",
    "New Zealand",
    "Saudi Arabia",
    "Singapore",
    "South Korea",
    "Spain",
    "Switzerland",
    "Thailand",
    "United Arab Emirates",
    "United Kingdom",
    "United States"
  ]

  const [geolocationEnabled, setGeolocationEnabled] = useState(false);

  const [loading, setLoading] = useState(false);

  const [listing, setListing] = useState(false);

  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    country: '',
    location: '',
    address: '',
    isOffer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0
  });


  let {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    location,
    address,
    country,
    isOffer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude
  } = formData;

  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();

  const isMounted = useRef(true)


  //redirect if listing is not user's
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error('You can not edit that listing')
      navigate('/')
    }
  })


  //fetch listing to edit
  useEffect(() => {
    setLoading(true);

    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId)
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setListing(docSnap.data());

        //prepare obj to fill form with fetched data
        setFormData({
          ...docSnap.data(),
          latitude: docSnap.data().geolocation.lat,
          longitude: docSnap.data().geolocation.lng
        })

        setLoading(false);
      } else {
        navigate('/');
        toast.error('Listing does not exist')
      }
    }

    fetchListing();
  }, [params.listingId, navigate])



  //sets userRef to logged in user
  useEffect(() => {

    //if user is logged in set userRef in obj
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid })
        } else {
          navigate('/sign-in')
        }
      })
    }

    return () => {
      isMounted.current = false;
    }
  }, [isMounted])


  const onSubmit = async e => {
    e.preventDefault()
    setLoading(true);

    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error('Discounted price must be less than regular price');
      return
    }


    if (images.length > 6) {
      setLoading(false);
      toast.error('Max 6 Images');
      return
    }

    let geolocation = {}

    let key = import.meta.env.VITE_GEOCODE_API_KEY

    if (geolocationEnabled) {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`);

      const data = await response.json()

      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;


      address = data.status === 'ZERO_RESULTS'
        ? undefined
        : data.results[0]?.formatted_address;

      location = data.status === 'ZERO_RESULTS'
        ? undefined
        : `${data.results[0]?.address_components[3].long_name}`;

      country = data.status === 'ZERO_RESULTS'
        ? undefined
        : `${data.results[0].address_components[data.results[0].address_components.length - 2].long_name}`;


      if (location === undefined || location.includes('undefined')) {
        setLoading(false);
        toast.error('Please enter a correct address');
        return;
      }

    } else {
      //taken from lat and lng inputs
      geolocation.lat = latitude;
      geolocation.lng = longitude;
    }

    //Store images in firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const filename = `${auth.currentUser.uid}-${image.name}-${uuid()}`;
        const storageRef = ref(storage, 'images/' + filename)

        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on('state_changed',
          (snapshot) => {

            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');


            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
            }
          },
          (error) => {
            reject(error)
            // toast.error('Sorry, the listing couldn\'t be created. Try Again')
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref)
              .then((downloadURL) => {
                resolve(downloadURL);

              });
          }
        );

      })
    }

    const imgUrls = await Promise.all(
      [...images].map(image => storeImage(image))
    ).catch((e) => {
      setLoading(false);
      toast.error(e);
      return;
    })

    //prepare new listing data before insert in firestore
    const listingData = {
      ...formData,
      imgUrls,
      geolocation,
      publishedAt: serverTimestamp()
    }

    delete listingData.images;
    delete listingData.latitude;
    delete listingData.longitude;
    country && (listingData.country = country)
    location && (listingData.location = location);
    !listingData.isOffer && delete listingData.discountedPrice;



    const docRef = doc(db, 'listings', params.listingId);
    await updateDoc(docRef, listingData)

    setLoading(false);

    toast.success('The listing was successfully created');

    navigate(`/category/${listingData.type}/${docRef.id}`)




    setLoading(false)


  }


  const onMutate = e => {
    let boolean = null;
    //handle boolean values
    if (e.target.value === 'true') {
      boolean = true
    }
    if (e.target.value === 'false') {
      boolean = false
    }

    //handle files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files
      }))
    }



    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value
      }))
    }


  }



  if (loading) {
    return <Spinner />
  }


  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit Listing</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <label htmlFor="" className="formLabel">Sell / Rent</label>
          <div className="formButtons">
            <button
              type="button"
              className={type === "sale" ? "formButtonActive" : "formButton"}
              id='type'
              value='sale'
              onClick={onMutate}>
              Sell
            </button>
            <button
              type="button"
              className={type === "rent" ? "formButtonActive" : "formButton"}
              id='type'
              value='rent'
              onClick={onMutate}>
              Rent
            </button>
          </div>
          <label htmlFor="" className="formLabel">Name</label>
          <input
            className="formInputName"
            type="text"
            id="name"
            value={name}
            onChange={onMutate}
            maxLength='45'
            minLength='10'
            required
          />
          <div className="formRooms flex">
            <div>
              <label htmlFor="" className="formLabel">Bedrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bedrooms"
                value={bedrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
            <div>
              <label htmlFor="" className="formLabel">Bathrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bathrooms"
                value={bathrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
          </div>
          <label htmlFor="" className="formLabel">Parking Spot</label>
          <div className="formButtons">
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type="button"
              id='parking'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={!parking && parking !== null ? 'formButtonActive' : 'formButton'}
              type="button"
              id='parking'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label htmlFor="" className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type="button"
              id='furnished'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={!furnished && furnished !== null ? 'formButtonActive' : 'formButton'}
              type="button"
              id='furnished'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label htmlFor="" className="formLabel">Address</label>
          <textarea
            id="address"
            type="text"
            className="formInputAddress"
            value={address}
            onChange={onMutate}
            required
          />
          {!geolocationEnabled && (
            <>
              <label htmlFor="" className="formLabel">Country</label>
              <select onChange={onMutate} id="country" className="formInputSelect" value={country}>
                {countries.map((value, index) =>
                  (<option key={index + value} value={value}>{value}</option>)
                )}
              </select>
            </>
          )
          }
          {!geolocationEnabled && (
            <>
              <label htmlFor="" className="formLabel">City</label>
              <input
                className="formInputName"
                type="text"
                id="location"
                value={location}
                onChange={onMutate}
                maxLength='32'
                minLength='2'
                required
              />
            </>
          )
          }
          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  type="number"
                  className="formInputSmall"
                  id="latitude"
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  type="number"
                  className="formInputSmall"
                  id="longitude"
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}
          <label htmlFor="" className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              className={isOffer ? 'formButtonActive' : 'formButton'}
              type="button"
              id="isOffer"
              value={true}
              onClick={onMutate}>
              Yes
            </button>
            <button
              className={!isOffer && isOffer !== null ? 'formButtonActive' : 'formButton'}
              type="button"
              id="isOffer"
              value={false}
              onClick={onMutate}>
              No
            </button>
          </div>
          <label htmlFor="" className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            <input
              className="formInputSmall"
              type="number"
              id="regularPrice"
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='750000000'
              required
            />
            {
              type == 'rent' && (
                <p className="formPriceText">$ / Month</p>
              )
            }
          </div>
          {
            isOffer && (
              <>
                <label htmlFor="" className="formLabel">Discounted Price</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="discountedPrice"
                  value={discountedPrice}
                  onChange={onMutate}
                  min='50'
                  max='750000000'
                  required={isOffer}
                />
              </>
            )
          }
          <label htmlFor="" className="formLabel">Images</label>
          <p className="imagesInfo">The first image will be the cover (max 6).</p>
          <input
            className="formInputFile"
            type="file"
            id="images"
            onChange={onMutate}
            max='6'
            accept=".jpg,.png,.jpeg"
            multiple
            required
          />
          <button
            className="primaryButton createListingButton"
            type="submit">
            Edit listing
          </button>
        </form>
      </main>
    </div>
  )
}

export default EditListing