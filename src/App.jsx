import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import { LoadingPage } from './components/States'

const Input       = lazy(() => import('./pages/Input'))
const Pipeline    = lazy(() => import('./pages/Pipeline'))
const Record      = lazy(() => import('./pages/Record'))
const FormatVal   = lazy(() => import('./pages/FormatVal'))
const BrandDetail = lazy(() => import('./pages/BrandDetail'))
const Adjudication= lazy(() => import('./pages/Adjudication'))
const ReviewQueue = lazy(() => import('./pages/ReviewQueue'))
const Batch       = lazy(() => import('./pages/Batch'))
const History     = lazy(() => import('./pages/History'))
const Audit       = lazy(() => import('./pages/Audit'))
const Settings    = lazy(() => import('./pages/Settings'))

function PageFallback() {
  return <LoadingPage label="Loading page..." />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/input" element={<Suspense fallback={<PageFallback />}><Input /></Suspense>} />
          <Route path="/pipeline/:id" element={<Suspense fallback={<PageFallback />}><Pipeline /></Suspense>} />
          <Route path="/record/:id" element={<Suspense fallback={<PageFallback />}><Record /></Suspense>} />
          <Route path="/format/:id" element={<Suspense fallback={<PageFallback />}><FormatVal /></Suspense>} />
          <Route path="/brand/:id" element={<Suspense fallback={<PageFallback />}><BrandDetail /></Suspense>} />
          <Route path="/adjudication/:id" element={<Suspense fallback={<PageFallback />}><Adjudication /></Suspense>} />
          <Route path="/queue" element={<Suspense fallback={<PageFallback />}><ReviewQueue /></Suspense>} />
          <Route path="/batch" element={<Suspense fallback={<PageFallback />}><Batch /></Suspense>} />
          <Route path="/history" element={<Suspense fallback={<PageFallback />}><History /></Suspense>} />
          <Route path="/audit" element={<Suspense fallback={<PageFallback />}><Audit /></Suspense>} />
          <Route path="/settings" element={<Suspense fallback={<PageFallback />}><Settings /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
