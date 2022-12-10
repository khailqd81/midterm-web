import './App.css';
import { QueryClientProvider, QueryClient } from 'react-query';
import ProtectedRoutes from './components/ProtectedRoutes';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

//
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import UserConfirm from "./components/UserConfirm";
import Home from './components/Home';
import PageNotFound from './components/PageNotFound';
import GroupInfo from './components/GroupInfo';
import GroupLink from './components/GroupLink';
import UserProfile from './components/UserProfile';
import Presentation from "./components/Presentation";
import { ToastContainer } from 'react-toastify';
import PresentationEdit from './components/PresentationEdit';
const queryClient = new QueryClient()

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <div>
        {/* <ToastContainer
                        position="top-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover={false}
                        theme="colored"
                    /> */}
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginForm />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/user/confirm" element={<UserConfirm />} />
              <Route path="/home/groups/join/:groupLink" element={<GroupLink />} />
              <Route element={<ProtectedRoutes />} >
                <Route path="/home" element={<Home />} />
                <Route path="/home/presentation" element={<Presentation/>} />
                <Route path="/home/presentation/:presentId" element={<PresentationEdit />} />
                <Route path="/home/profile" element={<UserProfile />} />
                <Route path="/home/groups/:groupId" element={<GroupInfo />} />
              </Route>
              <Route path='*' element={<PageNotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </QueryClientProvider>


  );
}

export default App;
