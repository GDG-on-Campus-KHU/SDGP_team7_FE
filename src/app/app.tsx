import { AppRoutes } from './router'
import { ConversationProvider } from './context/ConversationContext'

export default function App() {
  return (
    <ConversationProvider>
      <AppRoutes />
    </ConversationProvider>
  )
}
