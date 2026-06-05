import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function TrustRadar({ scores }) {
  const data = {
    labels: ['Behavioral', 'Contextual', 'Historical', 'Session Stability'],
    datasets: [{
      label: 'Trust Score',
      data: [
        scores?.behavioral_score ?? 0,
        scores?.contextual_score ?? 0,
        scores?.historical_score ?? 0,
        scores?.session_stability_score ?? 0,
      ],
      backgroundColor: 'rgba(0, 212, 170, 0.12)',
      borderColor: '#00d4aa',
      borderWidth: 2,
      pointBackgroundColor: '#00d4aa',
      pointBorderColor: '#0a0c10',
      pointRadius: 5,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { display: false, stepSize: 25 },
        grid: { color: '#1f2530' },
        angleLines: { color: '#1f2530' },
        pointLabels: {
          color: '#8892a4',
          font: { size: 12, family: 'DM Sans' }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111318',
        borderColor: '#1f2530',
        borderWidth: 1,
        titleColor: '#e8eaf0',
        bodyColor: '#8892a4',
        callbacks: {
          label: ctx => ` ${ctx.raw.toFixed(1)} / 100`
        }
      }
    }
  };

  return <Radar data={data} options={options} />;
}
