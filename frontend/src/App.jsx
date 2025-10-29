
import React, { useEffect, useState } from "react";
import FilterBar from "./components/FilterBar";
import KPICards from "./components/KPICards";
import TrainsTable from "./components/TrainsTable";
import axios from "axios";

function App() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [trains, setTrains] = useState([]);

  useEffect(() => {
    axios.get("/api/trains")
      .then(res => setTrains(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredTrains = trains.filter(train => {
    const matchesDate = train.timestamp.startsWith(date);
    const matchesDeparture = departure ? train.departure_station.includes(departure) : true;
    const matchesArrival = arrival ? train.arrival_station.includes(arrival) : true;
    return matchesDate && matchesDeparture && matchesArrival;
  });

  const avgDelay = filteredTrains.length
    ? (filteredTrains.reduce((sum, t) => sum + t.delay, 0) / filteredTrains.length).toFixed(1)
    : 0;

  const delayedCount = filteredTrains.filter(t => t.delay > 5).length;
  const punctualRate = filteredTrains.length
    ? Math.round((filteredTrains.filter(t => t.delay <= 5).length / filteredTrains.length) * 100)
    : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-blue-700 text-white px-6 py-4 shadow">
        <h1 className="text-2xl font-bold">SNCB Timing Dashboard</h1>
        <p className="text-sm">Analyse en temps réel de la ponctualité ferroviaire</p>
      </header>
      <main className="p-6 max-w-7xl mx-auto">
        <FilterBar
          date={date}
          setDate={setDate}
          departure={departure}
          setDeparture={setDeparture}
          arrival={arrival}
          setArrival={setArrival}
        />
        <KPICards
          averageDelay={avgDelay}
          delayedTrains={delayedCount}
          punctualityRate={punctualRate}
        />
        <TrainsTable trains={filteredTrains} />
      </main>
    </div>
  );
}

export default App;
