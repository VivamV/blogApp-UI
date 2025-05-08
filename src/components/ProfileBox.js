
import React from 'react';

const ProfileBox = ({username, email,profileimageURL, onLogout,showmyblogs}) => {
/*currently ,i am not using showmyblogs ,but i can use it in case,if i want to adda link like readYourBlogs inside ProfileBox*/

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 absolute top-16 right-8 w-80 z-50">
      <div className="flex items-center mb-4">
        <img
          src={profileimageURL}
          alt="Profile"
          className="w-16 h-16 rounded-full object-cover mr-4"
        />
        <div>
          <h2 className="text-2xl font-bold">{username}</h2>
          <p className="text-gray-600">{email}</p>
        </div>
      </div>
      <button className="mt-4 text-sky-500 hover:underline" onClick={onLogout}>Logout</button>
    </div>
  );
};

export default ProfileBox;
