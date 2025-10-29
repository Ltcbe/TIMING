import React from 'react';

export default function Stats({ averageDelay, delayedCount, onTimeRate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <h2 className="text-blue-800 text-lg font-semibold">🚆 Retard moyen</h2>
        <p className="text-2xl font-bold">{averageDelay} min</p>
        <p className="text-sm text-blue-600">Basé sur 100 trajets</p>
      </div>
      <div className="bg-red-50 border border-red-200 p-4 rounded">
        <h2 className="text-red-800 text-lg font-semibold">🎯 Trajets en retard</h2>
        <p className="text-2xl font-bold">{delayedCount}</p>
        <p className="text-sm text-red-600">Sur 100 trajets listés</p>
      </div>
      <div className="bg-green-50 border border-green-200 p-4 rounded">
        <h2 className="text-green-800 text-lg font-semibold">✅ Taux de ponctualité</h2>
        <p className="text-2xl font-bold">{onTimeRate}%</p>
        <p className="text-sm text-green-600">Trains à l'heure</p>
      </div>
    </div>
  );
}