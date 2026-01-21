"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Trophy, Clock } from "lucide-react";

const games = [
  {
    id: "chess",
    name: "Chess",
    description: "Play the classic game of strategy. Challenge yourself or compete for the leaderboard!",
    icon: "♟️",
    difficulty: "Medium",
    estimatedTime: "15-60 min",
  },
  {
    id: "tetris",
    name: "Tetris",
    description: "Stack blocks and clear lines in this timeless puzzle game. Accessible keyboard controls included!",
    icon: "🧱",
    difficulty: "Easy",
    estimatedTime: "5-20 min",
  },
];

export default function GamesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-primary flex items-center gap-3">
          <Gamepad2 className="w-8 h-8" /> Games
        </h1>
        <p className="text-muted-foreground">Have fun and compete with the community!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {games.map((game) => (
          <Link key={game.id} href={`/games/${game.id}`}>
            <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer" data-testid={`game-card-${game.id}`}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{game.icon}</div>
                  <div>
                    <CardTitle className="text-xl">{game.name}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" /> {game.difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {game.estimatedTime}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{game.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-8 bg-accent/10 border-accent">
        <CardContent className="py-6">
          <h3 className="font-display font-semibold text-lg mb-2 text-accent">Accessibility Features</h3>
          <ul className="text-muted-foreground space-y-1">
            <li>Full keyboard navigation support</li>
            <li>High contrast mode compatible</li>
            <li>Screen reader friendly</li>
            <li>Adjustable game speed (where applicable)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
