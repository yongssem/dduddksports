import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import EntryScreen from './components/EntryScreen'
import TeacherAuth from './components/teacher/TeacherAuth'
import Dashboard from './components/teacher/Dashboard'
import Settings from './components/teacher/Settings'
import JoinClass from './components/student/JoinClass'
import StudentHome from './components/student/StudentHome'
import RecordInput from './components/student/RecordInput'
import GrowthChart from './components/student/GrowthChart'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<EntryScreen />} />
          <Route path="/teacher/auth" element={<TeacherAuth />} />
          <Route path="/teacher/dashboard" element={<Dashboard />} />
          <Route path="/teacher/settings" element={<Settings />} />
          <Route path="/student/join" element={<JoinClass />} />
          <Route path="/student/home" element={<StudentHome />} />
          <Route path="/student/record" element={<RecordInput />} />
          <Route path="/student/growth" element={<GrowthChart />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
