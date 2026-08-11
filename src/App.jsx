import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Input from './pages/Input'
import Pipeline from './pages/Pipeline'
import Record from './pages/Record'
import Adjudication from './pages/Adjudication'
import ReviewQueue from './pages/ReviewQueue'
import Batch from './pages/Batch'
import History from './pages/History'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/input" element={<Input />} />
          <Route path="/pipeline/:id" element={<Pipeline />} />
          <Route path="/record/:id" element={<Record />} />
          <Route path="/adjudication/:id" element={<Adjudication />} />
          <Route path="/queue" element={<ReviewQueue />} />
          <Route path="/batch" element={<Batch />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
