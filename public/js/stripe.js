/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alert";

const stripe = Stripe(
  "pk_test_51SJZkeBlYn8edJIU3UzO9yoTogTOH3DAgwagCtXoDSbwJfgmwPgjF6WtNBF7qt39MubcKSiY4IQqFz1MWwqwvMo500Gj9eb0nc"
);

export const bookTour = async (tourId) => {
  try {
    //(1) get checkout API Endpoint using axios
    const session = await axios({
      url: `/api/v1/bookings/checkout-session/${tourId}`
    });
    if (session.data.session && session.data.session.url) {
      window.location.href = session.data.session.url;
    } else {
      bookBtn.textContent = "Book tour now!";
      showAlert(
        "error",
        "Error While booking your tour! please try again later"
      );
    }
    //console.log(session);
    //(2) create a checkout session form
  } catch (err) {
    //console.log(err.response.data.message);
    showAlert("error", err.response.data.message);
  }
};
