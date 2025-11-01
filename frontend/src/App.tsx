import { lazy, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Experiences } from "./types/types";

const LazyExperienceCard = lazy(() => import("./components/ExperienceCard"));

const App = () => {
  const [experiences, setExperiences] = useState<Experiences[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const name = searchParams.get("q");

  useEffect(() => {
    const controller = new AbortController();

    async function loadExperiences() {
      try {
        setLoading(true);

        const res = await fetch(
          `${import.meta.env.VITE_EXPERIENCES}/experiences?name=${
            name ? name : ""
          }`,
          { signal: controller.signal, mode: "cors" }
        );
        console.log({res});

        if (!res.ok) {
          console.log({ res });
          throw new Error("Failed to fetch experiences");
        }

        const data = await res.json();

        setExperiences(data.data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.log(err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadExperiences();
    return () => controller.abort();
  }, [name]);

  if (loading) return <p className="text-center p-4">Loading...</p>;
  if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

  return (
    <div className="flex gap-10 flex-wrap items-center ">
      <Suspense fallback={<p className="text-center p-4">Loading...</p>}>
        {experiences.map((exp) =>
          exp.imageUrl ? <LazyExperienceCard key={exp.id} exp={exp} /> : null
        )}
      </Suspense>
    </div>
  );
};

export default App;
