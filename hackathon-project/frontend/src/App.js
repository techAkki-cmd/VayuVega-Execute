import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [backendResponse, setBackendResponse] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8080/api/message")
      .then(response => setBackendResponse(response.data))
      .catch(error => console.error("Error fetching backend:", error));

    axios.get("http://localhost:8080/api/ai")
      .then(response => setAiResponse(response.data))
      .catch(error => console.error("Error fetching AI:", error));
  }, []);

  return (
    <div>
      <h1>Spring Boot + React + FastAPI</h1>
      <p><b>Backend Response:</b> {backendResponse}</p>
      <p><b>AI Response:</b> {aiResponse}</p>
    </div>
  );
}

export default App;
