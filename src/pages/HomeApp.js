
import React, { useState } from 'react';
import './HomeApp.css';
import Header from '../components/Header';
import CardApp from './CardApp';
import MainProfile from '../components/MainProfile';


const HomeApp = () => {
  const [showProfile, setShowProfile] = useState(false);

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
      {showProfile && <MainProfile/> }
      <CardApp/>
    </div>
  );
};

export default HomeApp;



