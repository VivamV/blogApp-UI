
import React, { useState } from 'react';
import { AiOutlineLike } from "react-icons/ai"
import { BiSolidLike  } from "react-icons/bi"

const Card = ({ id, image, title, author, likes,likesArray, onLike, profilepic, createdAt }) => {
  // let liked=false;
  // console.log("user hai bhai like meij",id);
  // console.log("pagal hai bhai lya",likesArray);
  let Liked1 = likesArray.includes(id);
  // console.log("like ka status",Liked1)


  const [isHovered, setIsHovered] = useState(false);

  const handleLike = () => {
    onLike();
  };

  const timestamp = createdAt;
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = date.getMonth() + 1; 
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return (
    <div
      className={`max-w-md w-full rounded overflow-hidden shadow-lg m-4 transform transition-transform duration-300 ${
        isHovered ? 'scale-105' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
        <img src={profilepic} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
        <span className="font-semibold text-sm">{author}</span>
      </div>
      <img className="w-full h-64 object-cover" src={image} alt={title} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{title}</div>
      </div>
      <div className="px-6 pt-4 pb-2 flex justify-between items-center">
        <button onClick={handleLike}>
          {
            Liked1 ? <BiSolidLike className={`text-blue-500 cursor-pointer text-2xl`} /> : <AiOutlineLike className={`text-blue-500 text-2xl cursor-pointer`} />
          }
          
        </button>
        <p className="text-gray-600 text-sm">{likes} Likes</p>
      </div>
      <div className="px-6 py-2">
        <p className="text-gray-600 text-sm">Made on {`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`}</p>
      </div>
    </div>
  );
};

export default Card;
