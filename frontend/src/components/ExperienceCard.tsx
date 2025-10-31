import { lazy, Suspense, useState } from "react";
import type { Experiences } from "../types/types";


const Lazy = lazy(() => {
  return import("./LazyImage");
});

const ExperienceCard = ({ exp }: { exp: Experiences }) => {
  const [valid, setValid] = useState(true);

  if (!valid) return null;

  return (
    <Suspense fallback={<p className="text-center p-4">Loading...</p>}>
      <Lazy
        exper={exp}
        className="aspect-[1.5] rounded-tl-xl rounded-tr-xl"
        onLoadError={() => setValid(false)}
      />
    </Suspense>
  );
};

export default ExperienceCard;
