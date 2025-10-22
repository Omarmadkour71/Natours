/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alert";

// type is either "password" or "profile"
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === "profile"
        ? "http://127.0.0.1:3000/api/v1/users/updateMyProfile"
        : "http://127.0.0.1:3000/api/v1/users/updateMyPassword";
    const res = await axios({
      method: "patch",
      url,
      data
    });

    if (res.data.status === "success") {
      showAlert("success", `${type} updated`);
    }
  } catch (err) {
    showAlert("error", "something went wrong! please try again");
    console.log(err.response.data.message);
  }
};
