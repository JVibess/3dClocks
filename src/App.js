import { Route, Routes } from "react-router-dom";
import "./App.css";
import ClockOne from "./Components/ClockOne/ClockOne";
import ClockTwo from "./Components/ClockTwo/ClockTwo";
import ClockThree from "./Components/ClockThree/ClockThree";
import Carousel from "./Components/Carousel/Carousel";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ClockOne />} />
        <Route path="/ClockTwo" element={<ClockTwo />} />
        <Route path="/ClockThree" element={<ClockThree />} />
      </Routes>
    </>
  );
}

export default App;
