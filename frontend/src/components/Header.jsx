import React from 'react';

export default function Header() {
  return (
    <header className="bg-blue-700 text-white p-4 shadow">
      <h1 className="text-xl font-bold">SNCB Timing Dashboard</h1>
      <p className="text-sm">Analyse en temps réel de la ponctualité ferroviaire</p>
    </header>
  );
}