/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alert";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "post",
      url: "/api/v1/users/login",
      data: {
        email, //email: email
        password //password: password
      }
    });

    if (res.data.status === "success") {
      showAlert("success", "Logged in Successfuly");
      window.setTimeout(() => {
        location.assign("/");
      }, 1000);
    }
    //console.log(res);
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "get",
      url: "/api/v1/users/logout"
    });

    if (res.data.status === "success") {
      showAlert("success", "Logged out successfuly");
      location.replace("/login");
    }
  } catch (err) {
    showAlert("error", "Something went Wrong! please try again");
  }
};
