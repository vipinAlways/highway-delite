import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckOutPage from "../checkout/CheckOutPage";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutProvider = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckOutPage />
    </Elements>
  );
};

export default CheckoutProvider;
