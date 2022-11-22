import './App.css';
import { QueryClientProvider, QueryClient } from 'react-query';
import ProtectedRoutes from './components/ProtectedRoutes';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Home from './components/Home';
import PageNotFound from './components/PageNotFound';
const queryClient = new QueryClient()

function App() {
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className='container mx-auto'>
        <div className=''>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginForm />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route element={<ProtectedRoutes />} >
                <Route path="/home" element={<Home />} />
              </Route>
              <Route path='*' element={<PageNotFound/>}/>
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </QueryClientProvider>


  );
}

export default App;
