
import React, {  useEffect,useState } from 'react'
import Cookies from 'js-cookie'
import axios from "axios"
import BlogsCard from '../components/BlogsCard';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import app from '../utils/firebase';
import {  useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const MyBlogs = () => {
  const navigate = useNavigate();
  const [newcardsData, setNewcardData] = useState([]);
  const [editBlog, setEditBlog] = useState(false);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [imageperc, setImageperc] = useState('');
  const [blogData, setBlogData] = useState({});
  const [currentBlogId, setCurrentBlogId] = useState(null);
  const [loginId,setLoginId]=useState();

  const [charCount, setCharCount] = useState(0);
  const charLimit = 200;

  const handleCaptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= charLimit) {
      setDescription(value);
      setCharCount(value.length);
    }
  };

  const handleCancel=()=>{
    setEditBlog(false);
    setCharCount(0);
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCharCount(0);

    try {
      if (currentBlogId) {
        await axios.put(
          `http://localhost:4000/v1/myblogs/${currentBlogId}`,
          { ...blogData, description },
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('token')}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        await axios.post( //i dont need it now,remove it later
          'http://localhost:4000/v1/createblogs',
          { ...blogData, description },
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('token')}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      navigate('/blogs');
      // console.log("/blogs ke neeche")
      // setEditBlog(false);
      // setCurrentBlogId(null);
      // setImage('');
      // setDescription('');
      // showblogs();
    } catch (error) {
      // console.error('There was an error submitting the form:', error);
      // alert('Error occurred while saving the blog');
      toast.error("Error occured while saving the blog,Description cant be empty")
    }
  };

  useEffect(() => {
    image && uploadFile(image);
  }, [image]);

  const uploadFile = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, 'images/' + fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageperc(progress);
        // console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            // console.log('Upload is paused');
            break;
          case 'running':
            // console.log('Upload is running');
            break;
          default:
        }
      },
      (error) => {
        // console.log(error);
      },
      () => { 
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // console.log('File available at', downloadURL);
          setBlogData((prevData) => ({ ...prevData, imagePath: downloadURL }));
        });
      }
    );
  };

  const handleLike = async (postId) => {
    try {
      const SavedValue = JSON.parse(localStorage.getItem("userin"));
 
      const userId=SavedValue._id;
      // console.log("like userid",userId);
      // console.log("like postid",postId);
      const response = await axios.post('http://localhost:4000/v1/like', {
        postId,
        userId
      }, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`,
          'Content-Type': 'application/json'
        }
      });
      // console.log(response.data);
      // console.log("likes",response.data.likes);
      if(response.data.message==="Token is not valid, or it's expired")
      {
        navigate("/")
      }
      setNewcardData(newcardsData.map(card => 
        card._id === postId ? { ...card, likes: response.data.likes} : card
      ));
      // console.log("newcarddatlike",newcardsData);
    } catch (error) {
      // console.error('There was an error liking the post:', error);
      // alert('Error liking the post in INdia');
      toast.error("Error liking post in ShowMyBlogs section")
    }
  };
 
  const showblogs = async () => {
    try {
      const response = await axios.get('http://localhost:4000/v1/myblogs', {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });

      setNewcardData(response.data.data);
      // console.log("show blogs",response.data.message)
      if(response.data.message==="Token is not valid, or it's expired")
       {
        // toast.error(response.data.message)
    // console.log(response.data.message)
        navigate("/")
      }
    } catch (error) {
      // console.error('There was an error fetching blogs:', error);
      // alert('Error fetching blogs');
      toast.error("Error fetching myBlogs")
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/v1/myblogs/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      setNewcardData(newcardsData.filter((blog) => blog._id !== id));
      // console.log("yahan tak aayega")
    } catch (error) {
      // console.error('Error deleting blog:', error);
    }
  };

  useEffect(() => {
    showblogs();
    const SavedValue = JSON.parse(localStorage.getItem("userin"));
const userId=SavedValue._id;
setLoginId(userId)
  }, []);

  const onEdit = (card) => {
    setEditBlog(true);
    setDescription(card.caption);
    setCharCount(card.caption.length)
    // setDescription("");
    setImage('');
    setBlogData(card);
    setCurrentBlogId(card._id);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center">
      
        {newcardsData.map((card, index) => (
          <BlogsCard
            key={index}
            id={loginId}
            postId={card._id}
            image={card.imageURL}
            title={card.caption}
            author={card.user.fullname}
            likes={card.likes.length}
            likesArray={card.likes}
            onLike={() => handleLike(card._id)}
            profilepic={card.user.profileimageURL}
            createdAt={card.createdAt}
            onDelete={handleDelete}
            onEdit={() => onEdit(card)}
          />
        ))}
     

   

   {editBlog && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
          <h2 className="text-2xl font-bold mb-6 text-center">Edit Blog</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Image URL
              </label>
              {imageperc > 0 && <p className="text-sm text-gray-500 mb-2">Uploading {imageperc}%</p>}
              <input
                type="file"
                id="img"
                accept="image/*"
                onChange={(e) => setImage((prev) => e.target.files[0])}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Caption
              </label>
              <textarea
                value={description}
                onChange={handleCaptionChange}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none h-32"
                placeholder="Write your caption here..."
                maxLength={charLimit}
              />
              <p className="text-sm text-gray-500 mt-1">{charCount}/{charLimit} characters</p>
              {charCount === charLimit && <p className="text-red-500 text-sm mt-1">Maximum limit reached</p>}
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
              >
                Save
              </button>
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

      </div>
      {newcardsData.length===0 && <div className='mx-auto text-2xl w-full text-center'>No Posts yet</div>}
      {/* <button onClick={() => window.history.back()}>Go Back</button> */}
      <ToastContainer/>
    </div>
  );
};

export default MyBlogs;
