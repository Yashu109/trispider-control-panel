// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Adminpanel from '../../Components/AdminPanel/Adminpanel'
// import Adminprofile from '../../Components/AdminProfile/AdminProfile'
// import Login from "../Login/Login";
// import UserDashboard from "../../Components/UserDashboard/UserDashboard";
// import EmployeePanel from '../../Components/EmployeePanel/EmployeePanel';

// const AppRouter = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/admin-panel" element={<Adminpanel/>}/>  
//         <Route path="/admin-profile" element={<Adminprofile/>}/>  
//         <Route path="/user-dashboard" element={<UserDashboard/>}/>
//         <Route path="/employee-panel" element={<EmployeePanel/>}/>
//       </Routes>
//     </Router>
//   );
// };

// export default AppRouter;
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from '../Login/Login';
import AdminPanel from '../AdminPanel/Adminpanel';
import Adminprofile from '../../Components/AdminProfile/AdminProfile'
import UserDashboard from '../UserDashboard/UserDashboard';
import EmployeePanel from '../../Components/EmployeePanel/EmployeePanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/login" element={<AuthForm />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/admin-profile" element={<Adminprofile/>}/> 
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/employee-panel" element={<EmployeePanel />} />
      </Routes>
    </Router>
  );
}

export default App;