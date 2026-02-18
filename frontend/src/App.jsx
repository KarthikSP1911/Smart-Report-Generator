import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [data, setData] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/fastapi")
      .then(res => setData(res.data.message))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>{data}</h1>
    </div>
  );
}

export default App;
