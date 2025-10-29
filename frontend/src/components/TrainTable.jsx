import React from 'react';

export default function TrainTable({ trains }) {
  return (
    <div className="mt-6 border rounded overflow-x-auto bg-white">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
          <tr>
            <th className="px-4 py-2">N° Train</th>
            <th className="px-4 py-2">Gare de départ</th>
            <th className="px-4 py-2">Gare d’arrivée</th>
            <th className="px-4 py-2">Heure prévue</th>
            <th className="px-4 py-2">Heure réelle</th>
            <th className="px-4 py-2">Retard</th>
            <th className="px-4 py-2">Statut</th>
          </tr>
        </thead>
        <tbody>
          {trains.map((t, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{t.train_id}</td>
              <td className="px-4 py-2">{t.departure_station}</td>
              <td className="px-4 py-2">{t.arrival_station}</td>
              <td className="px-4 py-2">{new Date(t.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
              <td className="px-4 py-2">{new Date(t.actual_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
              <td className="px-4 py-2">{t.delay} min</td>
              <td className="px-4 py-2">
                {t.delay > 10 ? <span className="text-red-500">🚨 En retard</span> : t.delay > 2 ? <span className="text-yellow-500">⚠️ Léger retard</span> : <span className="text-green-600">✅ À l’heure</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}