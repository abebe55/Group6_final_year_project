import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import useFetch from "../hooks/useFetch";

export default function Home() {
  const { data, loading, error } = useFetch("/search/tourism");

  return (
    <>
      <Header />
      <main style={{ padding: "1rem" }}>
        <h3>Tourism Places</h3>

        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}

        {data?.content?.map(place => (
          <div key={place.id}>
            <strong>{place.name}</strong> – Views: {place.viewersCount}
          </div>
        ))}
      </main>
      <Footer />
    </>
  );
}
