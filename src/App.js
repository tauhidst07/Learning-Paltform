import React from 'react'
import './App.css'
import { Route, Routes } from 'react-router'
import Home from './pages/Home'
import Navbar from './components/common/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from './pages/ResetPassword'
import VerifyOtp from './pages/VerifyOtp'
import About from './pages/About'
import ContactUs from './pages/ContactUs'
import { setProgress } from "./slices/loadingBarSlice";
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import MyProfile from "./components/core/Dashboard/MyProfile";
import Dashboard from './pages/Dashboard'
import Error from './pages/Error'; 
import Setting from "./components/core/Dashboard/Settings";
import EnrollledCourses from "./components/core/Dashboard/EnrolledCourses"; 
import PurchaseHistory from "./components/core/Dashboard/PurchaseHistory"; 
import { useSelector } from 'react-redux'; 
import Cart from "./components/core/Dashboard/Cart/index";
import { ACCOUNT_TYPE } from "./utils/constants";  
import AddCourse from "./components/core/Dashboard/AddCourse/index"; 
import MyCourses from "./components/core/Dashboard/MyCourses/MyCourses"; 
import EditCourse from "./components/core/Dashboard/EditCourse.jsx/EditCourse"; 
import InstructorDashboard from "./components/core/Dashboard/InstructorDashboard/InstructorDashboard";
import Catalog from './pages/Catalog';   
import CourseDetails from './pages/CourseDetails' 
import ViewCourse from './pages/ViewCourse' 
import VideoDetails from './components/core/ViewCourse/VideoDetails' 
import LoadingBar from "react-top-loading-bar"; 
import { useDispatch } from 'react-redux';  
import AdminPannel from './components/core/Dashboard/AdminPannel'


const App = () => { 
  const user = useSelector((state) => state.profile.user);
  const progress = useSelector((state) => state.loadingBar);
  const dispatch = useDispatch();
  return (  
    <div className='w-screen min-h-screen bg-richblack-900 flex-col font-inter'> 
    <LoadingBar
        color="#FFD60A"
        height={1.4}
        progress={progress}
        onLoaderFinished={() => dispatch(setProgress(0))}
      />
      <Navbar setProgress={setProgress} /> 
  
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/catalog/:catalog" element={<Catalog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password/:id" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyOtp />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactUs />} /> 
        <Route path="/courses/:courseId" element={<CourseDetails />} />
        <Route
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } >
          <Route path="dashboard/my-profile" element={<MyProfile />} />
          <Route path="dashboard/settings" element={<Setting />} />
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route path="dashboard/cart" element={<Cart />} />
              <Route
                path="dashboard/enrolled-courses"
                element={<EnrollledCourses />}
              />
              <Route
                path="dashboard/purchase-history"
                element={<PurchaseHistory />}
              />
            </>
          )} 
          {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
            <>
              <Route path="dashboard/add-course" element={<AddCourse />} />
              <Route path="dashboard/my-courses" element={<MyCourses />} />
              <Route
                path="dashboard/edit-course/:courseId"
                element={<EditCourse />}
              />
              <Route
                path="dashboard/instructor"
                element={<InstructorDashboard />}
              />
            </>
          )} 
          {user?.accountType === ACCOUNT_TYPE.ADMIN && (
            <>
              <Route path="dashboard/admin-panel" element={<AdminPannel />} />
            </>
          )}
        </Route> 
        <Route
          element={
            <PrivateRoute>
              <ViewCourse />
            </PrivateRoute>
          }
        >
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="/dashboard/enrolled-courses/view-course/:courseId/section/:sectionId/sub-section/:subsectionId"
                element={<VideoDetails />}
              />
            </>
          )}
        </Route>
        <Route path='*' element={<Home/>} />
      </Routes>
    </div>
  )
}

export default App