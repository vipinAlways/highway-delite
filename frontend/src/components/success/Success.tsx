import { Link } from "react-router-dom";

const Success = () => {
  return (
    <div className="w-full flex flex-col items-center gap-3">
      <span className="bg-green-500 text-white text-3xl font-medium rounded-full  size-16 flex items-center justify-center">
        &#10003;
      </span>
      <h1 className="font-medium text-3xl ">Booking Confirmed</h1>

      <Link
        to={"/"}
        className="bg-[#E3E3E3] text-[#656565] text-sm p-1 rounded-sm"
      >
        Back to home
      </Link>
    </div>
  );
};

export default Success;
