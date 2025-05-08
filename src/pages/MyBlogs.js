import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import BlogsCard from "../components/BlogsCard";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import clearStorage from "../utils/clearStorage";

const MyBlogs = () => {
  const navigate = useNavigate();

  const [image, setImage] = useState(""); /*for setting image in form*/
  const [imageperc, setImageperc] =
    useState(""); /*for settting perc of uploading*/
  const [blogData, setBlogData] = useState(
    {}
  ); /*for setting imageURL path from firebase*/
  const [description, setDescription] = useState("");
  const [charCount, setCharCount] = useState(0);
  const charLimit = 200;

  const [newcardsData, setNewcardData] = useState(
    []
  ); /*for cards/posts shown in myblogs */
  const [editBlog, setEditBlog] = useState(false); /*for opening the edit part*/
  const [currentBlogId, setCurrentBlogId] =
    useState(null); /* for editing post */
  const [loginId, setLoginId] =
    useState(); /*for finding user id from localStorage for liking post*/

  const handleCaptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= charLimit) {
      setDescription(value);
      setCharCount(value.length);
    }
  };

  useEffect(() => {
    /*for image uploadation*/
    image && uploadFile(image);
  }, [image]);

  const uploadFile = (file) => {
    /*for firebase image uploadation*/
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, "images/" + fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageperc(progress);
        // console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case "paused":
            // console.log('Upload is paused');
            break;
          case "running":
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
          setBlogData((prevData) => ({ ...prevData, imageURL: downloadURL }));
        });
      }
    );
  };

  const showblogs = async () => {
    /*to bring blogs written by logged in User */
    try {
      const response = await axios.get("http://localhost:4000/v1/myblogs", {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      console.log("Response received in SHOW MY BLOGS:", response);

      if (
        response.status === 200 &&
        response.data.message === "Token is not valid, or it's expired"
      ) {
        /*for auth middleware */
        console.log("inside token expired,show blogs");
        toast.error("Token expired");

        setTimeout(() => {
          clearStorage();
          navigate("/");
        }, 2000);
      } else if (response.status === 200) {
        setNewcardData(response?.data?.data);
      }
    } catch (error) {
      toast.error("Error fetching myBlogs");
    }
  };

  useEffect(() => {
    /*to show my blogs initially*/
    showblogs();
    const SavedValue = JSON.parse(localStorage.getItem("userin"));
    const userId = SavedValue._id;
    setLoginId(userId);
  }, []);

  const handleDelete = async (postId) => {
    /*to delete post from myblogs*/
    try {
      const response = await axios.delete(
        `http://localhost:4000/v1/myblogs/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (
        response.status === 200 &&
        response.data.message === "Token is not valid, or it's expired"
      ) {
        /*for auth middleware */
        console.log("inside token expired,deleteblogs");
        toast.error("Token expired");
        setTimeout(() => {
          clearStorage();
          navigate("/");
        }, 2000);
      } else if (response.status === 200) {
        setNewcardData(
          newcardsData.filter((blog) => blog._id !== postId)
        ); /*we are deleting only this postId*/
      }
    } catch (error) {
      toast.error("Error fetching myBlogs:::", error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/v1/like",
        {
          postId,
          loginId,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response in Liking Post::", response);

      if (
        response.status === 200 &&
        response.data.message === "Token is not valid, or it's expired"
      ) {
        /*for auth middleware */
        console.log("inside token expired,my like blogs");
        toast.error("Token expired");
        setTimeout(() => {
          clearStorage();
          navigate("/");
        }, 3000);
      } else if (response.status === 200) {
        setNewcardData(
          newcardsData.map((card) =>
            card._id === postId ? { ...card, likes: response.data.likes } : card
          )
        );
      } else if (response.status === 404) {
        toast.info("requested Post not found");
      }
    } catch (error) {
      toast.error("Error liking post in MyBlogs section:");
    }
  };

  const onEdit = (card) => {
    setDescription(card.caption);
    setCharCount(card.caption.length);
    setImage(""); //no issues even after commenting this
    // setImage("");
    setImageperc("");
    // setBlogData({});
    // setBlogData(card);//doubt
    setCurrentBlogId(card._id);
    setEditBlog(true);
  };

  const handleEditCancel = () => {
    setImage(""); //no issues even after commenting this
    setImageperc("");
    setBlogData({});
    setCharCount(0);
    setEditBlog(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCharCount(0);
    try {
      console.log(
        "blogData,description in handle Edit submit::",
        blogData,
        description
      );
      /*blogData has imagePath only */
      // if (currentBlogId) {
      const response = await axios.put(
        `http://localhost:4000/v1/myblogs/${currentBlogId}`,
        { ...blogData, description },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      // }
      // else {
      //   await axios.post( //i dont need it now,remove it later
      //     'http://localhost:4000/v1/createblogs',
      //     { ...blogData, description },
      //     {
      //       headers: {
      //         Authorization: `Bearer ${Cookies.get('token')}`,
      //         'Content-Type': 'application/json',
      //       },
      //     }
      //   );
      // }
      if (
        response.status === 200 &&
        response.data.message === "Token is not valid, or it's expired"
      ) {
        /*for auth middleware */
        console.log("inside token expired,hnadle edit");
        toast.error("Token expired");
        setTimeout(() => {
          clearStorage();
          navigate("/");
        }, 2000);
      } else if (response.status === 200) {
        navigate("/blogs");
      } else if (response.status === 404) {
        toast.info("Blog Post not found");
      }
    } catch (error) {
      toast.error(
        "Error occured while updating the blog,Description cant be empty"
      );
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center">
        {newcardsData.map((card, index) => (
          <BlogsCard
            key={index}
            userId={loginId}
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
                  {imageperc > 0 && (
                    <p className="text-sm text-gray-500 mb-2">
                      Uploading {imageperc}%
                    </p>
                  )}
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
                  <p className="text-sm text-gray-500 mt-1">
                    {charCount}/{charLimit} characters
                  </p>
                  {charCount === charLimit && (
                    <p className="text-red-500 text-sm mt-1">
                      Maximum limit reached
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={!description.trim()}
                    className={`${
                      !description.trim()
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-700"
                    } text-white font-bold py-2 px-6 rounded`}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
                    onClick={handleEditCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {newcardsData.length === 0 && (
        <div className="mx-auto text-2xl w-full text-center">No Posts yet</div>
      )}
      {/* <button onClick={() => window.history.back()}>Go Back</button> */}
      <ToastContainer />
    </div>
  );
};

export default MyBlogs;
