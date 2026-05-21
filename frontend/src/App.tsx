import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import FaceEmotion from './pages/FaceEmotion';
import TextEmotion from './pages/TextEmotion';
import SpeechEmotion from './pages/SpeechEmotion';
import History from './pages/History';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path='face' element={<FaceEmotion />} />
          <Route path='text' element={<TextEmotion />} />
          <Route path='speech' element={<SpeechEmotion />} />
          <Route path='history' element={<History />} />
          <Route path='settings' element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
