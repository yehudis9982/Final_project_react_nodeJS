// import './App.css';

// function App() {
//   return (
//     <div className="App">
//      hello world!!
//     </div>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* ...ראוטים נוספים... */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;