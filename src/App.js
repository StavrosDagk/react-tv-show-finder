import React, { Component, Fragment } from 'react';

import './App.css';
import Navbar from './components/layout/Navbar';
import Shows from './components/shows/Shows';
import Show from './components/shows/Show';

// Router for pages
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
// axios for http calls.
import axios from 'axios';
import About from './components/pages/About';
import Search from './components/shows/Search';
import Alert from './components/layout/Alert';

class App extends Component {
  state = {
    loading: false,
    shows: [],
    show: {},
    seasons: [],
    alert: null,
    authStr: 'Bearer ' + process.env.REACT_APP_TVDB_JWT
  };

  // Search shows by text
  searchShows = async text => {
    this.setState({ loading: true, seasons: [] });
    axios
      .get(`/search/series?name=${text}`, {
        headers: { Authorization: this.state.authStr, crossdomain: true }
      })
      .then(response => {
        this.setState({ shows: response.data.data, loading: false });
      })
      .catch(error => {
        console.log(error);
        this.setState({ loading: false });
        this.setAlert(error.message, 'dark');
      });
  };

  // Clear shows search results
  clearShows = () => {
    this.setState({ shows: [], loading: false, seasons: [] });
  };

  // set alert using message and a type to attach from css
  setAlert = (msg, type) => {
    this.setState({ alert: { msg, type } });
    setTimeout(() => {
      this.setState({ alert: null });
    }, 3000);
  };

  // Get show details.
  getShow = async id => {
    this.setState({ loading: true });

    axios
      .get(`/series/${id}`, {
        headers: { Authorization: this.state.authStr, crossdomain: true }
      })
      .then(response => {
        // console.log(response.data.data)
        this.setState({ show: response.data.data, loading: false });
      })
      .catch(error => {
        console.log(error);
        this.setState({ loading: false });
        this.setAlert(error.message, 'dark');
      });
  };

  // Get show seasons.
  getShowSeasons = async id => {
    this.setState({ loading: true, seasons: [] });

    axios
      .get(`/series/${id}/episodes/summary`, {
        headers: { Authorization: this.state.authStr, crossdomain: true }
      })
      .then(response => {
        this.setState({ seasons: response.data.data, loading: false });
      })
      .catch(error => {
        console.log(error);
        this.setState({ loading: false });
        this.setAlert(error.message, 'dark');
      });
  };

  //=============================================

  render() {
    const { shows, show, loading, alert, seasons } = this.state;

    return (
      <Router>
        <div className='App'>
          <Navbar />
          <div className='container'>
            <Alert alert={alert} />
            <Switch>
              <Route exact path='/'>
                <Fragment>
                  <Search
                    searchShows={this.searchShows}
                    clearShows={this.clearShows}
                    showClear={shows.length > 0 ? true : false}
                    setAlert={this.setAlert}
                  />
                  <Shows loading={loading} shows={shows} />
                </Fragment>
              </Route>
              <Route exact path='/about' component={About} />
              <Route
                exact
                path='/series/:id'
                render={props => (
                  <Show
                    {...props}
                    getShow={this.getShow}
                    getShowSeasons={this.getShowSeasons}
                    show={show}
                    loading={loading}
                    seasons={seasons}
                  />
                )}
              />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
