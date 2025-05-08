import { Routes, Route } from 'react-router-dom'
import { RootLayout } from './layout'
import Home from './routes/home'
import Conversation from './routes/conversation'

export const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<RootLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/conversation" element={<Conversation />} />
            </Route>
        </Routes>
    )
} 