import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopChurch from "./pages/topChurch";
import Payment from "./pages/payment";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
        <Route path="/top-church" element={<TopChurch />} />
        <Route path="/payment" element={<Payment />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
