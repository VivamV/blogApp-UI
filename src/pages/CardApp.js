import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import axios from "axios" 
import Cookies from 'js-cookie'
import { CircularProgress } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const CardApp = () => {
  const navigate=useNavigate();
  const [loading, setLoading] = useState(false);
 const [reachedEnd,setReachedEnd]=useState(false);
  const[newcardsData,setNewcardData]=useState([])
 const[cardLiked,setCardLiked]=useState(false);
 const [loginId,setLoginId]=useState();

 const [postCount, setPostCount] = useState(1);

 const fetchblogs = async (isInitial) => {
  
  try {
        //  console.log("entered try")
         const response = await axios.get(`http://localhost:4000/v1/blogs?postCount=${postCount}`, {
          headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`
          }
        });
        
          // console.log("re",response.data);
          const  posts  = response.data.data;
          // console.log("meri posts",posts);
         const totalCount=response.data.totalCount;
        //  console.log("DSfs",totalCount);
      //  console.log(response.data.message)
       
       if(response.data.message==="Token is not valid, or it's expired")
          {toast.error(response.data.message)
          navigate("/")
          }
         if(isInitial)
         {setNewcardData(posts)}
   else if (newcardsData.length  < totalCount) {//matlab suppose i have 9 posts ,so max length can be 8<9 tab tak add karte raho
      setNewcardData((prev) => [...prev,...posts]);
      // console.log(newcardsData);
    }
    else
    {
      //  console.log("kabhi toh aao else main");
      setReachedEnd(true);
    }
    setLoading(false);
} catch (error) {
          // console.error('There was an error logging in:', error);
          // if(response.data.message==="Token is not valid, or it's expired")
          // navigate("/")
          // alert('blog page par erroruiu');
          toast.error("Error occured in Main ReadBlogs ")
        }
};


  const infiniteScroll = async () => {
    
    try {
      if (
        !loading &&
          document.documentElement.scrollTop + window.innerHeight+ 1 >=
          document.documentElement.scrollHeight
      ) {
        setLoading(true);
        setTimeout(() => {
          setPostCount((prev) => prev + 1); 
        }, 3000);
      }
    } catch (error) {
      // console.log(error.message);
    }
  };
  
  useEffect(() => {
    fetchblogs(true);
    const SavedValue = JSON.parse(localStorage.getItem("userin"));
const userId=SavedValue._id;
setLoginId(userId)
  }, []);
  
  useEffect(() => {
    if (postCount > 1) {
      fetchblogs(false); 
    }
  }, [postCount]);

useEffect(() => {
    window.addEventListener("scroll", infiniteScroll);
    return () => window.removeEventListener("scroll", infiniteScroll);
  }); 

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
      // console.log("isme aaya isliked",response.data);
      if(response.data.message==="Token is not valid, or it's expired")
      {toast.error(response.data.message)
        navigate("/")
      }
      setCardLiked(response.data.isLiked);
// console.log("likes",response.data.likes);
      setNewcardData(newcardsData.map(card => 
        card._id === postId ? { ...card, likes: response.data.likes} : card
      ));
      // console.log("newcarddatlike",newcardsData);
    } catch (error) {
      // console.error('There was an error liking the post:', error);
      // alert('Error liking the post in INdia');
      toast.error('Error liking post in ReadBlogs Section')
    }
  };
 

  return (
    <div>

    <div className="flex flex-wrap justify-center">
   
      {newcardsData && newcardsData.map((card, index) => (
        <Card 
         
          key={index}
          id={loginId}
          image={card.imageURL}
          title={card.caption}
          author={card.user.fullname}
          likes={card.likes.length}
          likesArray={card.likes}
          onLike={() => handleLike(card._id)}
          profilepic={card.user.profileimageURL}
          createdAt={card.createdAt}
        />
      ))}
   
    </div>
    {newcardsData.length===0 && <div>No data yet</div>}
    {newcardsData.length !== 0 && !reachedEnd && (
         <CircularProgress/>
        )}
        <ToastContainer/>
    </div>
  );
};

export default CardApp;
