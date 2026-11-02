import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ApplyPage from '../pages/ApplyPage'
import NotFoundPage from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <ApplyPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])