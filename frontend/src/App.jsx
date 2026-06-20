import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyList from './pages/MyList';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"           element={<BookList />} />
          <Route path="/books/:id"  element={<BookDetail />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/my-list"    element={<MyList />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}