import React from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";

import Login from "./pages/login/login";
import Admin from "./pages/admin/admin";

import './App.less';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={'/login'} element={<Login/>}/>
                <Route path={'*'} element={<Admin/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
