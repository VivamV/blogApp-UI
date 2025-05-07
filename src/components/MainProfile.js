import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'
import ProfileBox from "./ProfileBox"

const MainProfile = () => {
  const navigate=useNavigate();
  const [showProfile, setShowProfile] = useState(true);
  const[username,setUsername]=useState("Varun Pratap Singh");
  const [email,setEmail]=useState("vpsingh@gmail.com")
  const [profilepicture,setProfilePicture]=useState()

  const showmyblogs=async()=>{
    navigate("/myblogs");
  }

  const handleProfileClick =async () => {
    setShowProfile(true);
    const SavedValue = JSON.parse(localStorage.getItem("userin"));
    // console.log(SavedValue);
    if (SavedValue) 
   {   setUsername(SavedValue.fullname)
       setEmail(SavedValue.email);
       setProfilePicture(SavedValue.profileimageURL)
      //  console.log("dsfe",profilepicture);
   }
    else if(SavedValue === null){
      setUsername("DummyUser")
      setEmail("dummyUser&gmail.com");
      setProfilePicture()
    }
  };
useEffect(()=>{
handleProfileClick()
},[])
  const handleLogout = () => {
    setShowProfile(false);
    localStorage.removeItem("userin")
    Cookies.remove('token');        
    navigate("/")
    // console.log('Logged out');
  };


  return (
    <div className="flex flex-col items-center  p-4">
      {showProfile && (
        <ProfileBox
          username={username}
          email={email}
          profileimageURL={profilepicture}
          onLogout={handleLogout}
          showmyblogs={showmyblogs}
        />
      )}
    </div>
  );
};

export default MainProfile;
