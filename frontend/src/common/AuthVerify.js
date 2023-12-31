import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

const AuthVerify = (props) => {
  let location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    // console.log(user);

    if (user) {
      // const decodedJwt = parseJwt(user.accessToken);
      const decodedJwt = parseJwt(user.data.access_token);


      if (decodedJwt.exp * 1000 < Date.now()) {
        props.logOut();
      }
    }
  }, [location, props]);

  return <div></div>;
};

export default AuthVerify;
