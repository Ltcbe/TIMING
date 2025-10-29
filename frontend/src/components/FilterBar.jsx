
import React from "react";

const FilterBar = ({ date, setDate, departure, setDeparture, arrival, setArrival }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">📅 Date</label>
        <input
          type="date"
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">🚉 Gare de départ</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Toutes les gares"
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">🏁 Gare d'arrivée</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Toutes les gares"
          value={arrival}
          onChange={(e) => setArrival(e.target.value)}
        />
      </div>
    </div>
  );
};

export default FilterBar;
