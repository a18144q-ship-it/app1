/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import AI from './pages/AI';
import Focus from './pages/Focus';
import Stats from './pages/Stats';
import Sync from './pages/Sync';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="ai" element={<AI />} />
            <Route path="focus" element={<Focus />} />
            <Route path="stats" element={<Stats />} />
            <Route path="sync" element={<Sync />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
