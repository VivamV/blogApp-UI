
import React, { useState } from 'react';
import './HomeApp.css';
import Header from '../components/Header';
import MyBlogs from './MyBlogs';
import MainProfile from '../components/MainProfile';

const MyBlogsApp = () => {
  const [showProfile, setShowProfile] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false); 

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
  };

  return (
    <div className="min-h-screen bg-sky-100">
      <div className="relative">
        <Header onProfileClick={handleProfileClick} />
        <img
          src="island.jpg"
          alt="Travel"
          className="w-full h-[800px] object-cover"
        />
      </div>
      {showProfile && <MainProfile />}
      <MyBlogs/>
    </div>
  );
};

export default MyBlogsApp;



