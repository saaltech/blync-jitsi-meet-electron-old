
export function isTokenExpired() {
    const { expires = 0 } = APP.store.getState()['features/app-auth']
    let isValid = false;
    if( expires > (new Date()).getTime()) {
        isValid = true;
    }
    return isValid;
}

export function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

/**
 * Validate Meeting ID
 */
export function validateMeetingCode(code) {
    return /^\d{2}-\d{13}-\d{3}$/g.test(code);
}

export function setToken(tokenRequired, authenticationHeader = false) {
    let headerDetails = {
      'Content-Type': 'application/json'
    }

    if(authenticationHeader) {
        headerDetails["Authentication"] = APP.store.getState()['features/app-auth'].accessToken
    }

    if(tokenRequired) {
      Object.assign(headerDetails, {
              'Authorization': 'Bearer ' + APP.store.getState()['features/app-auth'].accessToken
          }
      )
    }

    return  {
      'headers': headerDetails
    }
  }

export function validateToken(){
    let isTokenValid = true;
    let appAuth = APP.store.getState()['features/app-auth']

    let tokenExpiryTimestamp = (appAuth && appAuth.expires) || -1;
    let tokenExpiryTime = -1
    try {
        tokenExpiryTime = parseInt(tokenExpiryTimestamp);
        if (
            tokenExpiryTime < 1 ||
            (tokenExpiryTime < (new Date()).getTime())
        ){
            isTokenValid = false
        }
    } catch (err) {
        console.error(err);
    } finally {
        return isTokenValid
    }
}
