import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Grid3X3, Trophy } from "lucide-react";
import { useGameLeaderboard } from "@/hooks/use-games";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";

export default function Games() {
  return (
    <Layout>
      <SEO 
        title="Game Center" 
        description="Play accessible games like Chess and Block Stacker. Relax, have fun, and challenge friends in the DisabilitySquare Game Center."
      />
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-display font-bold text-primary mb-2" data-testid="text-game-center-title">Game Center</h1>
          <p className="text-lg text-muted-foreground">Relax, play, and challenge friends.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chess Card */}
          <GameCard 
            title="Chess" 
            description="The classic strategy game. Play against the computer or challenge a friend."
            icon={Gamepad2}
            href="/games/chess"
            color="bg-amber-100 dark:bg-amber-900/20"
          />
          
          {/* Tetris Card */}
          <GameCard 
            title="Block Stacker" 
            description="A classic block stacking puzzle. Clear lines and beat the high score!"
            icon={Grid3X3}
            href="/games/tetris"
            color="bg-blue-100 dark:bg-blue-900/20"
          />
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-accent" /> Global Leaderboards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Leaderboard gameName="chess" />
            <Leaderboard gameName="tetris" />
          </div>
        </div>
      </div>
    </Layout>
  );
}

function GameCard({ title, description, icon: Icon, href, color }: any) {
  const testId = title.toLowerCase().replace(/\s+/g, '-');
  return (
    <Card className={`overflow-hidden border-2 border-transparent hover:border-primary transition-all group`} data-testid={`card-game-${testId}`}>
      <div className={`h-40 ${color} flex items-center justify-center`}>
        <Icon className="h-20 w-20 text-primary/80 group-hover:scale-110 transition-transform duration-300" />
      </div>
      <CardHeader>
        <CardTitle className="font-display text-3xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground text-lg">{description}</p>
        <Link href={href}>
          <Button size="lg" className="w-full" data-testid={`button-play-${testId}`}>Play Now</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function Leaderboard({ gameName }: { gameName: string }) {
  const { data: scores, isLoading } = useGameLeaderboard(gameName);

  return (
    <Card>
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="capitalize flex justify-between items-center">
          {gameName === 'tetris' ? 'Block Stacker' : gameName}
          <span className="text-sm font-normal text-muted-foreground">Top 5</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <div className="divide-y">
            {scores?.slice(0, 5).map((score, index) => (
              <div key={score.id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                <div className="flex items-center gap-4">
                  <span className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'}
                  `}>
                    #{index + 1}
                  </span>
                  <span className="font-medium">
                    {score.user.firstName} {score.user.lastName?.[0]}.
                  </span>
                </div>
                <span className="font-mono font-bold text-primary">{score.score} pts</span>
              </div>
            ))}
            {scores?.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No scores yet!</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
