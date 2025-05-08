import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import axios from "axios" 
import Cookies from 'js-cookie'
import { CircularProgress } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import clearStorage from '../utils/clearStorage';


const CardApp = () => {
  const navigate=useNavigate();

  const [loading, setLoading] = useState(false);/*for showing loading*/
  const [reachedEnd,setReachedEnd]=useState(false);/*for checking if we reached at end or not,if we reached at end ,then stop Circular Progress*/
  const [postCount, setPostCount] = useState(1);/*for fetching posts  from server,if post count=2,it means skip ,first 3 posts and bring new 3 posts*/

  const[newcardsData,setNewcardData]=useState([])/* for showing posts on read blogs page*/
  const [loginId,setLoginId]=useState(); /*for setting login id from localStorage for liking the post*/

 const fetchblogs = async (isInitial) => {

  try {
         const response = await axios.get(`http://localhost:4000/v1/blogs?postCount=${postCount}`, {
          headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`
          }
        });
        
          console.log("Response for fetch blogs in Blogs page::",response);
          
          const  posts  = response?.data?.data;
          const totalCount=response?.data?.totalCount;

      if(response.status === 200 && response.data.message==="Token is not valid, or it's expired")/*for auth middleware*/
        { console.log("inside token expired,fetch blogs,cardapp")
          toast.error(response.data.message)
          setTimeout(()=>{
            clearStorage()
            navigate("/")
            },2000)
        }

      else if(response.status === 200 && isInitial)
        {setNewcardData(posts)}
      else if (response.status === 200 && newcardsData.length  < totalCount) {//matlab suppose i have 9 posts ,so max length can be 8<9 tab tak add karte raho
        setNewcardData((prev) => [...prev,...posts]);
      }
      else
      {
      setReachedEnd(true);
      }
    setLoading(false);
} catch (error) {
          toast.error("Error occured in ReadBlogs Sectin")
        }
};

useEffect(() => {
  fetchblogs(true);
  const SavedValue = JSON.parse(localStorage.getItem("userin"));
  const userId=SavedValue._id;
  setLoginId(userId)
}, []);

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
       console.log(error.message);
    }
  };
  

useEffect(() => {
  window.addEventListener("scroll", infiniteScroll);
  return () => window.removeEventListener("scroll", infiniteScroll);
}); 

  useEffect(() => {
    if (postCount > 1) {
      fetchblogs(false); 
    }
  }, [postCount]);

  const handleLike = async (postId) => {
    try {
      const response = await axios.post('http://localhost:4000/v1/like', {
        postId,
        loginId
      }, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`,
          'Content-Type': 'application/json'
        }
      });
       console.log("Response in Liking Post on ReadBlogs::",response);

       if(response.status === 200 && response.data.message==="Token is not valid, or it's expired")/*for auth middleware */
       { console.log("response in like in all blogs tpken expired")
         toast.error(response.data.message)
         setTimeout(()=>{
           clearStorage()
           navigate("/")
           },2000)
       }
      else if(response.status === 200){
        setNewcardData(newcardsData.map(card => 
          card._id === postId ? { ...card, likes: response.data.likes} : card
        ));
      }
      else if(response.status === 404){
        toast.info("requested Post not found")
      }
     
      
    } catch (error) {
      toast.error("Error liking post in ReadBlogs section:")
    }
  };
 

  return (
    <div>

    <div className="flex flex-wrap justify-center">
   
      {newcardsData && newcardsData.map((card, index) => (
        <Card  
          key={index}
          userId={loginId}
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
