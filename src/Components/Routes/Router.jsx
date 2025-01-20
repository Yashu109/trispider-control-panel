import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Adminpanel from '../../Components/AdminPanel/Adminpanel'
import Adminprofile from '../../Components/AdminProfile/AdminProfile'
import Login from "../Login/Login";
import UserDashboard from "../../Components/UserDashboard/UserDashboard";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-panel" element={<Adminpanel/>}/>  
        <Route path="/admin-profile" element={<Adminprofile/>}/>  
        <Route path="/user-dashboard" element={<UserDashboard/>}/>
      </Routes>
    </Router>
  );
};

export default AppRouter;
