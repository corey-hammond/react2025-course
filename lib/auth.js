import React, { useState, useEffect, useContext, createContext } from 'react';
import firebase from './firebase';
import { createUser } from './firestore';

const authContext = createContext();

export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  console.log(useContext(authContext));
  return useContext(authContext);
};

function useProvideAuth() {
  const [user, setUser] = useState(null);

  console.log(user);

  const handleUser = (rawUser) => {
    if (rawUser) {
      const user = formatUser(rawUser);

      createUser(user.uid, user);

      setUser(user);
      return user;
    } else {
      setUser(false);
      return false;
    }
  };

  const signinWithGitHub = () => {
    return firebase
      .auth()
      .signInWithPopup(new firebase.auth.GithubAuthProvider())
      .then((response) => {
        handleUser(response.user);
      });
  };

  // const signup = (email, password) => {
  //     return firebase
  //         .auth()
  //         .createUserWithEmailAndPassword(email, password)
  //         .then((response) => {
  //             setUser(response.user);
  //             return response.user;
  //         });
  // };

  const signout = () => {
    return firebase
      .auth()
      .signOut()
      .then(() => handleUser(false));
  };

  // const sendPasswordResetEmail = (email) => {
  //     return firebase
  //         .auth()
  //         .sendPasswordResetEmail(email)
  //         .then(() => {
  //             return true;
  //         });
  // };

  // const confirmPasswordReset = (password, code) => {
  //     const resetCode = code || getFromQueryString('oobCode');

  //     return firebase
  //         .auth()
  //         .confirmPasswordReset(resetCode, password)
  //         .then(() => {
  //             return true;
  //         });
  // };

  useEffect(() => {
    const unsubscribe = firebase
      .auth()
      .onAuthStateChanged((user) => handleUser(user));

    return () => unsubscribe();
  }, []);

  return {
    user,
    signinWithGitHub,
    signout,
  };
}

// const getFromQueryString = (key) => {
//   return queryString.parse(window.location.search)[key];
// };

const formatUser = (user) => {
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    provider: user.providerData[0].providerId,
    photoURL: user.photoURL,
  };
};
