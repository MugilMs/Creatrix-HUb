import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Categories } from './pages/Categories';
import { Trending } from './pages/Trending';
import { CreatorProfile } from './pages/CreatorProfile';
import { PostView } from './pages/PostView';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { LoginForm } from './components/auth/LoginForm';

function App() {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="categories" element={<Categories />} />
          <Route path="trending" element={<Trending />} />
          <Route path="creator/:username" element={<CreatorProfile />} />
          <Route path="post/:postId" element={<PostView />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="login" element={<LoginForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
