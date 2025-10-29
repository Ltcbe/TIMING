import React from 'react';

export default function FilterBar({ date, setDate, stations, departure, setDeparture, arrival, setArrival }) {
  return (
    <div className="grid md:grid-cols-3 gap-4 my-4 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-700">📅 Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full mt-1 border rounded p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">🚉 Gare de départ</label>
        <select value={departure} onChange={e => setDeparture(e.target.value)} className="w-full mt-1 border rounded p-2">
          <option value="">Toutes les gares</option>
          {stations.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">🚉 Gare d'arrivée</label>
        <select value={arrival} onChange={e => setArrival(e.target.value)} className="w-full mt-1 border rounded p-2">
          <option value="">Toutes les gares</option>
          {stations.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}