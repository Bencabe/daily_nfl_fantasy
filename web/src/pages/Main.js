import React, {Component} from 'react'
import {
    BrowserRouter as Router,
    Routes,
    Route
  } from "react-router-dom";
import Team from './Team/Team.js'
import Fixtures from './Fixtures.js'
import League  from './League/League.js'
import Layout from './Layout.js';

class Main extends Component {
    render() {
        return(
            <div>
                <Router>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Team />} />
                            <Route path="league" element={<League />} />
                            <Route path="fixtures" element={<Fixtures />} />
                        </Route>
                    </Routes>
                </Router>
            </div>
            

        );
    }
}
export default Main