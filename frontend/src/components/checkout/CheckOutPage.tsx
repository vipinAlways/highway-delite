import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStripe, useElements } from "@stripe/react-stripe-js";

function CheckOutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [phone, setPhone] = useState("");
  const [promocode, setPromocode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!location.state) {
      navigate("/");
    }
  }, [location, navigate]);

  const {
    experience,
    slotId,
    date,
    timeSlot,
    quantity,
    subtotal,
    availableSeats,
  } = location.state || {};

  const finalSubtotal = subtotal - discount;
  const finalTaxes = Math.floor((5 / 100) * finalSubtotal);
  const finalTotal = Math.round(finalSubtotal + finalTaxes);

  const getTimingDisplay = (slot: string) => {
    const timings: Record<string, string> = {
      MORNING: "9:00 AM - 12:00 PM",
      AFTERNOON: "12:00 PM - 3:00 PM",
      EVENING: "3:00 PM - 6:00 PM",
      NIGHT: "6:00 PM - 9:00 PM",
    };
    return timings[slot] || "";
  };

  const handleApplyPromo = async () => {
    if (!promocode) {
      setErrorMessage("Please enter a promo code");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_EXPERIENCES}/promo/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: promocode,
            totalAmount: subtotal,
          }),
        }
      );

      const result = await response.json();
      console.log(result);

      if (result.ok && response.status === 200) {
        const discountAmount = (result.discount / 100) * subtotal;
        setDiscount(discountAmount);
        setPromoApplied(true);
        setErrorMessage("");
        alert(`Promo code applied! You saved ₹${discountAmount}`);
      } else {
        setPromoApplied(false);
        setDiscount(0);
        setErrorMessage(result.message);
      }
    } catch (error: unknown) {
      setErrorMessage("Failed to validate promo code");
      console.error("Promo validation error:", error);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("Payment system not loaded. Please refresh the page.");
      return;
    }

    if (!name || !mail) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mail)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_EXPERIENCES}/bookings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMail: mail,
            slotId,
            numberOfSeats: quantity,
            userName: name,
            userPhone: phone,
            date,
            timeSlot,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success || response.status !== 200) {
        throw new Error(data.message || "Failed to create booking");
      } else {
        navigate("/success");
      }
    } catch (error: unknown) {
      if (error instanceof Error)
        setErrorMessage(error.message || "Booking failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!location.state) {
    return null;
  }

  return (
    <div className="flex gap-6 p-4 max-w-7xl mx-auto">
      <div className="flex-1">
        <form
          method="POST"
          onSubmit={handleBooking}
          className="bg-[#EFEFEF] p-6 flex flex-col gap-4 rounded-lg"
        >
          <h2 className="text-2xl font-semibold mb-2">Booking Details</h2>

          {/* Name and Email */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="name" className="font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#DDDDDD] p-3 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="email" className="font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                className="bg-[#DDDDDD] p-3 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="font-medium">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phone"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-[#DDDDDD] p-3 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="promocode" className="font-medium">
              Promo Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="promocode"
                placeholder="Enter promo code (e.g., SAVE10)"
                value={promocode}
                onChange={(e) => setPromocode(e.target.value)}
                className="flex-1 p-3 bg-[#DDDDDD] rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                disabled={promoApplied}
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="bg-yellow-400 px-6 py-3 rounded font-semibold hover:bg-yellow-300 transition disabled:opacity-50"
                disabled={promoApplied || !promocode.trim()}
              >
                {promoApplied ? "Applied ✓" : "Apply"}
              </button>
            </div>
            {promoApplied && (
              <p className="text-green-600 text-sm">
                ✓ Promo code applied! You saved ₹{discount}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="check" required />
            <label htmlFor="check" className="text-sm">
              I agree to the terms and safety policy
            </label>
          </div>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="bg-yellow-400 text-black py-3 rounded-md font-semibold hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing || !stripe}
          >
            {isProcessing ? "Processing..." : `Pay ₹${finalTotal}`}
          </button>
        </form>
      </div>

      <div className="sticky top-4 h-fit w-1/4 min-w-[280px]">
        <div className="p-4 rounded-lg shadow-lg bg-[#EFEFEF] space-y-3 text-[#3c3c3c]">
          <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>

          <div className="flex justify-between">
            <span>Experience</span>
            <span className="font-semibold text-right">{experience?.name}</span>
          </div>

          <div className="flex justify-between">
            <span>Date</span>
            <span className="font-semibold">
              {new Date(date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex justify-between items-start">
            <span>Time Slot</span>
            <div className="flex flex-col gap-1 items-end">
              <span className="font-semibold capitalize">
                {timeSlot?.toLowerCase()}
              </span>
              <span className="font-light text-xs">
                {getTimingDisplay(timeSlot)}
              </span>
            </div>
          </div>

          <div className="flex justify-between">
            <span>Quantity</span>
            <span className="font-semibold">{quantity}</span>
          </div>

          {availableSeats < 5 && availableSeats > 0 && (
            <p className="text-xs text-orange-600 text-center bg-orange-50 p-2 rounded">
              ⚠️ Only {availableSeats} seats available
            </p>
          )}

          <div className="border-t pt-2 mt-2"></div>

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          {promoApplied && discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({promocode})</span>
              <span>-₹{discount}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Taxes (5%)</span>
            <span>₹{finalTaxes}</span>
          </div>

          <div className="border-t pt-2 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>₹{finalTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckOutPage;
