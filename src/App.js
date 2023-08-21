import "./App.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import VideoPage from "./Pages/VideoPage";
import CommentAnalysisPage from "./Pages/CommentAnalysisPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<Homepage />}></Route>
          <Route path="/video" element={<VideoPage />}></Route>
          <Route
            path="/commentAnalysis"
            element={<CommentAnalysisPage />}
          ></Route>
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
