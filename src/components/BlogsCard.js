import { React, useState } from "react";
import { AiOutlineLike } from "react-icons/ai";
import { BiSolidLike } from "react-icons/bi";

const BlogsCard = ({
  userId,
  postId,
  image,
  title,
  author,
  likes,
  likesArray,
  onLike,
  profilepic,
  createdAt,
  onDelete,
  onEdit,
}) => {
  let Liked1 =
    likesArray.includes(
      userId
    ); /*It checks whether UserId is present in the likesArray,meqans logged in user has liked it or not*/
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

  const [isHovered, setIsHovered] =
    useState(false); /* to make post big or small on hovering*/

  const handleDeleted = async () => {
    onDelete(postId);
  };
  return (
    <div
      className={`max-w-md w-full rounded overflow-hidden shadow-lg m-4 transform transition-transform duration-300 ${
        isHovered ? "scale-105" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
        <img
          src={profilepic}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="font-semibold text-sm">{author}</span>
      </div>
      <img className="w-full h-64 object-cover" src={image} alt={title} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{title}</div>
      </div>
      <div className="px-6 pt-4 pb-2 flex justify-between items-center">
        <button onClick={handleLike}>
          {Liked1 ? (
            <BiSolidLike className={`text-blue-500 cursor-pointer text-2xl`} />
          ) : (
            <AiOutlineLike
              className={`text-blue-500 text-2xl cursor-pointer`}
            />
          )}
        </button>
        <p className="text-gray-600 text-sm">{likes} Likes</p>
      </div>

      <div className="px-6 py-2">
        <p className="text-gray-600 text-sm">
          Made on {`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`}
        </p>
      </div>
      <div className="px-6 pt-4 pb-0">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-4"
          onClick={onEdit}
        >
          Edit
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleDeleted}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default BlogsCard;
