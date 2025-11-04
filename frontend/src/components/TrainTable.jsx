import React from 'react';

export default function TrainTable({ trains }) {
  // ✅ Fonction pour sécuriser le parsing de date
  const safeDate = (dateString) => {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? null : d;
  };

  return (
    <div className="mt-6 border rounded overflow-x-auto bg-white">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
          <tr>
            <th className="px-4 py-2">🚆 Train</th>
            <th className="px-4 py-2">📍Gare de départ</th>
            <th className="px-4 py-2">🎯 Gare d'arrivée</th>
            <th className="px-4 py-2">🕒 Heure prévue</th>
            <th className="px-4 py-2">✅ Heure réelle</th>
            <th className="px-4 py-2">⏱️ Retard</th>
            <th className="px-4 py-2">📌 Statut</th>
          </tr>
        </thead>
        <tbody>
          {trains.map((t, i) => {
            const sched = safeDate(t.scheduled_time);
            const actual = safeDate(t.actual_time);

            return (
              <tr key={i} className="border-t">
                <td className="px-4 py-2">{t.train_id}</td>
                <td className="px-4 py-2">{t.departure_station}</td>
                <td className="px-4 py-2">{t.arrival_station}</td>
                <td className="px-4 py-2">
                  {sched ? sched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </td>
                <td className="px-4 py-2">
                  {actual ? actual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </td>
                <td className="px-4 py-2">{t.delay} min</td>
                <td className="px-4 py-2">
                  {t.delay > 10 ? (
                    <span className="text-red-500">🔺 En retard</span>
                  ) : t.delay > 2 ? (
                    <span className="text-yellow-500">⚠️ Léger retard</span>
                  ) : (
                    <span className="text-green-500">✔️ À l'heure</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
