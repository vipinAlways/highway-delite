import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Page from "./Page";
import CheckExperiences from "./components/experiences/CheckExperiences";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckOutPage from "./components/checkout/CheckOutPage";
import Success from "./components/success/Success";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
console.log({ stripePromise });
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Page />}>
      <Route path="/" element={<App />} />
      <Route path="/experiences/:id" element={<CheckExperiences />} />
      <Route path="/checkout" element={<CheckOutPage />} />
      <Route path="/success" element={<Success />} />
    </Route>
  )
);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <RouterProvider router={router} />
    </Elements>
  </React.StrictMode>
);
