import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Stats from './components/Stats';
import FilterBar from './components/FilterBar';
import TrainTable from './components/TrainTable';
import axios from 'axios';

export default function App() {
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [stations, setStations] = useState([]);

  // ✅ Charger tous les trajets au démarrage
  useEffect(() => {
    axios.get('/api/trains')
      .then(res => {
        setTrains(res.data || []);
        // Extraire la liste des gares
        const allStations = res.data.flatMap(t => [t.departure_station, t.arrival_station]).filter(Boolean);
        setStations([...new Set(allStations)].sort());
      })
      .catch(err => console.error("Erreur de récupération des trains :", err));
  }, []);

  // ✅ Filtrage avec gestion des dates invalides
  useEffect(() => {
    const result = trains.filter(t => {
      if (!t.scheduled_time) return false; // Ignore les entrées vides

      let trainDate;
      try {
        trainDate = new Date(t.scheduled_time).toISOString().split('T')[0];
      } catch {
        return false; // Si erreur de parsing, on saute cette ligne
      }

      const matchDate = trainDate === date;
      const matchDeparture = !departure || t.departure_station === departure;
      const matchArrival = !arrival || t.arrival_station === arrival;

      return matchDate && matchDeparture && matchArrival;
    });

    setFilteredTrains(result);
  }, [trains, date, departure, arrival]);

  // ✅ Statistiques
  const avgDelay = filteredTrains.length
    ? (filteredTrains.reduce((sum, t) => sum + (t.delay || 0), 0) / filteredTrains.length).toFixed(1)
    : 0;

  const delayCount = filteredTrains.filter(t => t.delay > 5).length;
  const onTimeRate = filteredTrains.length
    ? Math.round((filteredTrains.filter(t => t.delay <= 5).length / filteredTrains.length) * 100)
    : 0;

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto p-4">
        <FilterBar
          date={date}
          setDate={setDate}
          departure={departure}
          setDeparture={setDeparture}
          arrival={arrival}
          setArrival={setArrival}
          stations={stations}
        />
        <Stats averageDelay={avgDelay} delayedCount={delayCount} onTimeRate={onTimeRate} />
        <TrainTable trains={filteredTrains} />
      </main>
    </div>
  );
}
