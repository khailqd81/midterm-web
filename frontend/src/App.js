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
import GroupMember from './components/GroupMember';
import GroupLink from './components/GroupLink';

const queryClient = new QueryClient()

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <div>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginForm />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/user/confirm" element={<UserConfirm />} />
              <Route element={<ProtectedRoutes />} >
                <Route path="/home" element={<Home />} />
                <Route path="/home/groups/:groupId" element={<GroupMember />} />
                <Route path="/home/groups/join/:groupLink" element={<GroupLink />} />
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
