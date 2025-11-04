import React from "react";

const TrainsTable = ({ trains }) => {
  const getStatus = (delay) => {
    if (delay === 0) return "🟢 À l’heure";
    if (delay > 0 && delay <= 5) return "🟡 Léger retard";
    return "🔴 En retard";
  };

  const getBadgeClass = (delay) => {
    if (delay === 0) return "text-green-700 bg-green-100";
    if (delay > 0 && delay <= 5) return "text-yellow-700 bg-yellow-100";
    return "text-red-700 bg-red-100";
  };

  // ✅ Fonction utilitaire sécurisée pour afficher une heure
  const formatTime = (timeValue) => {
    if (!timeValue) return "—"; // si null/undefined/vide
    const d = new Date(timeValue);
    if (isNaN(d.getTime())) return "—"; // si date invalide
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        📋 Détail des trajets ({trains.length})
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-100 text-left">
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
            {trains.map((train, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-2">{train.train_id}</td>
                <td className="px-4 py-2">{train.departure_station}</td>
                <td className="px-4 py-2">{train.arrival_station}</td>

                {/* ✅ Sécurisation de l’affichage des dates */}
                <td className="px-4 py-2">{formatTime(train.scheduled_time)}</td>
                <td className="px-4 py-2">{formatTime(train.actual_time)}</td>

                <td className="px-4 py-2">{train.delay ?? "—"} min</td>
                <td className="px-4 py-2">
                  <span
                    className={
                      "px-2 py-1 rounded-full text-xs font-medium " +
                      getBadgeClass(train.delay)
                    }
                  >
                    {getStatus(train.delay)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrainsTable;
