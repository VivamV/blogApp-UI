import React from "react";
import { Link } from "react-router-dom";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app from "../utils/firebase";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import clearStorage from "../utils/clearStorage";

const Header = ({ onProfileClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showForm, setShowForm] = useState(false);

  const [image, setImage] = useState(""); /*for storing image */
  const [imageperc, setImageperc] =
    useState(""); /*for seeing image uploading progress*/
  const [blogData, setBlogData] = useState(
    {}
  ); /*for setting imageURL path only*/
  const [description, setDescription] = useState("");
  const [charCount, setCharCount] = useState(0);
  const charLimit = 200;

  const handleCreateBlog = () => {
    setImage("");
    setImageperc("");
    setBlogData({});
    setDescription("");
    setCharCount(0);
    setShowForm(true);
  };

  const handleCaptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= charLimit) {
      setDescription(value);
      setCharCount(value.length);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("CREATE BLOG: BLOGdATA,DESCRIPTION", blogData, description);
      /*blogData has imagePath only */
      const response = await axios.post(
        "http://localhost:4000/v1/createblogs",
        { ...blogData, description },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      console.log("response in create blog", response);
      if (
        response.status === 200 &&
        response.data.message === "Token is not valid, or it's expired,header"
      ) {
        /*from auth middleware*/
        console.log("inside token expired,create blog");
        toast.error(response.data.message);
        setTimeout(() => {
          clearStorage();
          navigate("/");
        }, 2000);
      } else if (response.status === 200) {
        if (location.pathname === "/blogs") {
          navigate("/myblogs");
        } else if (location.pathname === "/myblogs") {
          navigate("/blogs");
        }
      }
    } catch (error) {
      // console.error('There was an creating blog:', error);
      toast.error(
        "Description is Compulsory ,please give description altleast"
      );
    }
    setShowForm(false);
  };

  useEffect(() => {
    /*for image uplodation on firebase*/
    if (image) {
      uploadFile(image);
    }
  }, [image]);

  const uploadFile = (file) => {
    /*firebase image upload*/
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
        // console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            // console.log("Upload is paused");
            break;
          case "running":
            // console.log("Upload is running");
            break;
          default:
        }
      },
      (error) => {
        console.log("firebase error", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);
          setBlogData({
            ...blogData,
            imagePath: downloadURL,
          });
        });
      }
    );
  };
  const handleCancel = () => {
    setImage("");
    setImageperc("");
    setBlogData({});
    setDescription("");
    setCharCount(0);
    setShowForm(false);
  };
  return (
    <header className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-transparent text-white z-10 sticky-nav">
      <h1 className="text-3xl font-extrabold">BackpackersBlogs</h1>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link to="/blogs">Read Blogs</Link>
          </li>
          <li>
            <Link to="/myblogs">ShowMyBlogs</Link>
          </li>
          <li>
            <button onClick={handleCreateBlog} className="hover:underline">
              Create Blog
            </button>
          </li>

          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  Add New Blog
                </h2>
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
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={handleCaptionChange}
                      className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none h-32"
                      placeholder="Write your description here..."
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
                      disabled={
                        !description.trim() || !image || imageperc !== 100
                      }
                      className={`${
                        !description.trim() || !image || imageperc !== 100
                          ? "bg-blue-300 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-700"
                      } text-white font-bold py-2 px-6 rounded`}
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
          <li>
            <button onClick={onProfileClick} className="hover:underline">
              My Profile
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
