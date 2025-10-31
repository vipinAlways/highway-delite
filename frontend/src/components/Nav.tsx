import { useCallback, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const Nav = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState<string>("");

  const handleClick = useCallback(() => {
    setSearchParams({ q: search });
  }, [searchParams]);
  return (
    <div className="w-full flex justify-between">
      <Link to={"/"}>
        <img
          src="/logo.png"
          alt="dsd"
          loading="lazy"
          className="h-20 w-32 object-contain "
        />
      </Link>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search experiences"
          className="bg-[#EDEDED] rounded-sm p-1.5 w-60 text-base px-3 "
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="btn-color rounded-md p-1.5 text-base px-3"
          onClick={handleClick}
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default Nav;
