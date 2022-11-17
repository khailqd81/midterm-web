import './App.css';
import { Outlet } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from 'react-query';
const queryClient = new QueryClient()

function App() {

  return (
    <QueryClientProvider client={queryClient}>
    <div className='container mx-auto'>
      <div className=''>
          <Outlet />
      </div>
    </div>
    </QueryClientProvider>
  );
}

export default App;
