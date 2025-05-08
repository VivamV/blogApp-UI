

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import NoMatch from "./NoMatch";
import HomeApp from "./HomeApp";
import MyBlogsApp from "./MyBlogsApp";
import PublicRoutes from "./PublicRoutes";

const Routing = () => {
  return (
    <BrowserRouter>
      <Routes>
      <Route element={<PublicRoutes />}>
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<SignupForm />} />
        </Route>

         <Route element={<ProtectedRoutes/>}>
      
         <Route path="blogs" element={<HomeApp/>} />
        <Route path="myblogs" element={<MyBlogsApp/>}/>
     </Route> 
        <Route path="*" element={<NoMatch/>}></Route>  
       
      </Routes>
    </BrowserRouter>
  );
};

export default Routing

