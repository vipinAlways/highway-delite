import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import type {
  DateAvailability,
  AvailabilityResponse,
  Experiences,
} from "../../types/types";

const timings = [
  {
    shift: "MORNING",
    time: "9:00 AM - 12:00 PM",
  },
  {
    shift: "AFTERNOON",
    time: "12:00 PM - 3:00 PM",
  },
  {
    shift: "EVENING",
    time: "3:00 PM - 6:00 PM",
  },
  {
    shift: "NIGHT",
    time: "6:00 PM - 9:00 PM",
  },
];

const CheckExperiences = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Experiences | null>(null);
  const [availability, setAvailability] = useState<DateAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<string>("MORNING");
  const [selectedShiftTimeSlot, setSelectedShiftTimeSlot] =
    useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);
  const pricePerUnit = data?.price ?? 0;
  const subtotal = pricePerUnit * quantity;
  const taxes = Math.floor((5 / 100) * pricePerUnit * quantity);
  const total = Math.round(subtotal + taxes);

  const currentSlot = availability
    .find((day) => day.date === selectedDate)
    ?.slots.find((slot) => slot.timeSlot === selectedShift);

  const availableSeats = currentSlot?.availableSeats ?? 0;
  const isSlotAvailable = currentSlot?.isAvailable ?? true;

  useEffect(() => {
    const controller = new AbortController();

    async function loadExperienceAvailability() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${import.meta.env.VITE_EXPERIENCES}/experiences/${id}/availability`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error("Failed to fetch experience availability");

        const result: AvailabilityResponse = await res.json();

        setAvailability(result.data.availability);

        if (result.data.availability.length > 0) {
          setSelectedDate(result.data.availability[0].date);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadExperienceAvailability();
    }

    return () => controller.abort();
  }, [id]);
  useEffect(() => {
    const controller = new AbortController();

    async function loadExperiences() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_EXPERIENCES}/experiences/${id}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error("Failed to fetch experiences");

        const data = await res.json();
        setData(data.data);
      } catch (err: unknown) {
        setError(`Server Issue Try again ${err}`);
      }
    }

    loadExperiences();
    return () => controller.abort();
  }, [id]);

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const handleCheckOut = async () => {
    if (!currentSlot || !data) {
      alert("Please select a valid date and time slot");
      return;
    }
    if (!id) {
      alert("Please select a valid date and time slot");
      return;
    }

    if (quantity > availableSeats) {
      alert(`Only ${availableSeats} seats available for this slot`);
      return;
    }

    if (!isSlotAvailable) {
      alert("This slot is fully booked. Please select another slot.");
      return;
    }

    try {
      setIsCreatingSlot(true);

      const slotResponse = await fetch(
        `${import.meta.env.VITE_EXPERIENCES}/slots/get-or-create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            experienceId: id,
            date: selectedDate,
            timeSlot: selectedShift,
          }),
        }
      );

      if (!slotResponse.ok) {
        console.log("slotResponse", slotResponse);
        throw new Error("Failed to create slot");
      }

      const slotData = await slotResponse.json();

      navigate("/checkout", {
        state: {
          experience: data,
          slotId: slotData.data.id,
          date: selectedDate,
          timeSlot: selectedShift,
          quantity: quantity,
          subtotal: subtotal,
          taxes: taxes,
          total: total,
          availableSeats: availableSeats,
          timeSlotTiming: selectedShiftTimeSlot,
        },
      });
    } catch (err: unknown) {
      alert(err);
    } finally {
      setIsCreatingSlot(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading experience details...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <p className="text-xl text-red-500">
            {error || "Server Issue. Please try again later."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#FFD53F] rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative flex justify-evenly gap-8 p-4">
      <div className="flex flex-col items-center h-full w-3/5 gap-4">
        <img
          src={data?.imageUrl ?? ""}
          alt={data.name}
          className="w-full aspect-[2] rounded-xl object-cover"
          loading="lazy"
        />

        <div className="flex flex-col space-y-3 w-full">
          <div className="space-y-3 w-full">
            <h1 className="font-medium text-2xl">{data.name}</h1>
            <p className="font-light text-sm">{data.description}</p>
            <p className="text-sm text-gray-600">
              📍 {data.address}, {data.city}, {data.state}
            </p>
          </div>

          <div className="space-y-3 w-full">
            <h1 className="text-xl font-medium">Choose Date</h1>

            <div className="flex items-center gap-2 flex-wrap">
              {availability.map((dateInfo, index) => {
                const isSelected = dateInfo.date === selectedDate;
                const hasAvailableSlots = dateInfo.slots.some(
                  (slot) => slot.isAvailable
                );

                return (
                  <button
                    key={index}
                    className={`border text-[#838383] border-[#BDBDBD] p-2 rounded-sm min-w-20 ${
                      isSelected && "btn-color text-black border-0"
                    } ${!hasAvailableSlots && "opacity-50 cursor-not-allowed"}`}
                    onClick={() => setSelectedDate(dateInfo.date)}
                    disabled={!hasAvailableSlots}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium">
                        {formatDateDisplay(dateInfo.date)}
                      </span>
                      <span className="text-xs">{dateInfo.dayOfWeek}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <span className="font-light text-sm">
              All times are in IST (GMT +5:30)
            </span>
          </div>

          <div className="space-y-3 w-full">
            <h1 className="text-xl font-medium">Choose Time</h1>

            <div className="flex items-center gap-2 flex-wrap">
              {timings.map((timing, index) => {
                const isSelected = timing.shift === selectedShift;
                const slotInfo = availability
                  .find((day) => day.date === selectedDate)
                  ?.slots.find((slot) => slot.timeSlot === timing.shift);

                const isAvailable = slotInfo?.isAvailable ?? true;
                const seats = slotInfo?.availableSeats ?? 5;

                return (
                  <button
                    key={index}
                    className={`border text-[#838383] border-[#BDBDBD] p-2 rounded-sm flex-1 min-w-[120px] ${
                      isSelected && "btn-color text-black border-0"
                    } ${!isAvailable && "opacity-50 cursor-not-allowed"}`}
                    onClick={() => {
                      setSelectedShift(timing.shift);
                      setSelectedShiftTimeSlot(timing.time);
                    }}
                    disabled={!isAvailable}
                  >
                    <div className="flex flex-col">
                      <span className="capitalize font-medium">
                        {timing.shift.toLowerCase()}
                      </span>
                      <span className="text-xs">{timing.time}</span>
                      <span
                        className={`text-xs mt-1 ${
                          isAvailable ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isAvailable ? `${seats} seats left` : "Sold Out"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <span className="font-light text-sm">
              All times are in IST (GMT +5:30)
            </span>
          </div>

          <div className="space-y-3 w-full">
            <h1 className="text-xl font-medium">About</h1>
            <p className="font-light text-sm bg-[#EEEEEE] rounded-sm p-3 w-full text-[#838383]">
              Scenic routes, trained guides, and safety briefing. Minimum age
              10. All necessary equipment provided.
            </p>
          </div>
        </div>
      </div>

      <div className="sticky top-4 left-0 h-fit w-1/5 min-w-[280px]">
        <div className="p-4 rounded-lg shadow-lg w-full bg-[#EFEFEF] space-y-3 text-[#3c3c3c]">
          <div className="flex justify-between w-full">
            <span>Starts at</span>
            <span className="font-semibold">₹{data.price}</span>
          </div>

          <div className="flex justify-between w-full items-center">
            <span>Quantity</span>

            <div className="flex items-center gap-2">
              <button
                className="border px-2 py-1 rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                disabled={quantity === 1}
                onClick={() => setQuantity(quantity - 1)}
              >
                -
              </button>

              <span className="min-w-[30px] text-center font-medium">
                {quantity}
              </span>

              <button
                className="border px-2 py-1 rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                disabled={quantity >= availableSeats}
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Show available seats warning */}
          {availableSeats < 5 && availableSeats > 0 && (
            <div className="text-xs text-orange-600 text-center">
              Only {availableSeats} seats available
            </div>
          )}

          <div className="flex justify-between w-full">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="flex justify-between w-full">
            <span>Taxes (5%)</span>
            <span>₹{taxes}</span>
          </div>

          <div className="border-t pt-2 flex justify-between w-full font-semibold text-lg">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <button
            className="w-full bg-[#FFD53F] text-black py-3 rounded-md font-semibold hover:bg-[#ffd000] transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCheckOut}
            disabled={
              !isSlotAvailable || isCreatingSlot || quantity > availableSeats
            }
          >
            {isCreatingSlot
              ? "Processing..."
              : !isSlotAvailable
              ? "Sold Out"
              : "Confirm Booking"}
          </button>

          {!isSlotAvailable && (
            <p className="text-xs text-red-600 text-center">
              This slot is fully booked. Please select another time.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckExperiences;
