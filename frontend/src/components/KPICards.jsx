
import React from "react";

const KPICards = ({ averageDelay, delayedTrains, punctualityRate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow">
        <p className="text-gray-600 text-sm">⏱️ Retard moyen</p>
        <h3 className="text-2xl font-semibold text-blue-800">{averageDelay} min</h3>
        <p className="text-xs text-gray-500">Basé sur 100 trajets</p>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow">
        <p className="text-gray-600 text-sm">🚨 Trajets en retard</p>
        <h3 className="text-2xl font-semibold text-red-800">{delayedTrains}</h3>
        <p className="text-xs text-gray-500">Sur 100 trajets listés</p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow">
        <p className="text-gray-600 text-sm">✅ Taux de ponctualité</p>
        <h3 className="text-2xl font-semibold text-green-800">{punctualityRate}%</h3>
        <p className="text-xs text-gray-500">Trains à l’heure</p>
      </div>
    </div>
  );
};

export default KPICards;
