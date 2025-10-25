import React from 'react';

interface GameStatsProps {
  score: number;
  highScore: number;
  gamesPlayed: number;
  bestStreak: number;
  currentStreak: number;
}

const GameStats: React.FC<GameStatsProps> = ({
  score,
  highScore,
  gamesPlayed,
  bestStreak,
  currentStreak
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
      <h3 className="text-lg font-bold text-white mb-4 text-center">Game Statistics</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Current Game Stats */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">Current Score:</span>
            <span className="text-white font-bold">{score}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Current Streak:</span>
            <span className="text-green-400 font-bold">{currentStreak}</span>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">High Score:</span>
            <span className="text-yellow-400 font-bold">{highScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Games Played:</span>
            <span className="text-blue-400 font-bold">{gamesPlayed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Best Streak:</span>
            <span className="text-purple-400 font-bold">{bestStreak}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStats;
