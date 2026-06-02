import { useEffect, useState } from "react"
import axios from "axios"

function App() {
  const [status, setStatus] = useState("checking...")

  useEffect(() => {
    axios.get("http://localhost:8000/api/health/")
      .then(res => setStatus(res.data.status))
      .catch(() => setStatus("Connection failed"))
  }, [])

  return <div><h1>Backend says: {status}</h1></div>
}

export default App