import axios from 'axios';
import React, { useState } from 'react';
import { setToken, validateToken } from '../app-auth/functions';
import { resolveAppLogout, resolveAppLogin, invalidateAndGoHome } from '../app-auth/actions';
import configs from '../config'

export default ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (tokenRequired = false, skipRelogin = false) => {
    try {
      setErrors(null);
      let validToken = !tokenRequired || validateToken();
      const config = configs;
      //TODO check for !validToken once testing is done
      if(!validToken) {
        // Try refreshToken call
        let appAuth = APP.store.getState()['features/app-auth']
        let refreshToken = appAuth && appAuth.refreshToken

        if(refreshToken) {
          try {
            const res = await axios.post(
              config.unauthenticatedIRP + config.refreshToken, 
              {
                refresh_token: refreshToken
              })
              APP.store.dispatch(resolveAppLogin(res.data, true))
          }
          catch(e) {
            console.log("refresh Token error", e)
            if(e && e.response && e.response.status == 401) {
              // only in case of invalid grant
              invalidateAndGoHome(skipRelogin);
              return;
            }
          }
        }
        else {
          // if it fails, Clear features/app-auth and move to home page
          invalidateAndGoHome(skipRelogin);
          return;
        }
      }

      const isGetMethod = method.toLowerCase() === 'post' || method.toLowerCase() === 'put'

      const response = await axios[method](`${configs.defaultServerURL}/${url}`, 
        isGetMethod ? 
        (typeof body === "function" ? body() : body) :
        setToken(tokenRequired)
        , 
        isGetMethod ? setToken(tokenRequired) : false);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      console.log("Request Failed: ", err)
      console.log("Error Details: ", err.response)
      setErrors(
        err.response.data.errors || err.response.data.error || "Unable to process"
      );
    }
  };

  return [ doRequest, errors ];
};
