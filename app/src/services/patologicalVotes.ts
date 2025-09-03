import type { PatologicalVoteStats } from "../types";


interface LocalVoteStats {
  [targetUserId: number]: {
    antipato: number;
    pato_no_tucupi: number;
    patotastico: number;
    votes: { [voterId: number]: string };
  };
}

class PatologicalVoteService {
  private readonly VOTES_KEY = "patological_votes_global";
  private readonly USER_VOTES_KEY = "patological_user_votes";

  private getGlobalStats(): LocalVoteStats {
    try {
      const stats = localStorage.getItem(this.VOTES_KEY);
      return stats ? JSON.parse(stats) : {};
    } catch (error) {
      console.error("Error reading global votes:", error);
      return {};
    }
  }

  private saveGlobalStats(stats: LocalVoteStats) {
    try {
      localStorage.setItem(this.VOTES_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error("Error saving global votes:", error);
    }
  }

  private getUserVote(voterId: number, targetUserId: number): string | undefined {
    try {
      const userVotes = localStorage.getItem(`${this.USER_VOTES_KEY}_${voterId}`);
      const votes = userVotes ? JSON.parse(userVotes) : {};
      return votes[targetUserId];
    } catch (error) {
      console.error("Error reading user votes:", error);
      return undefined;
    }
  }

  private saveUserVote(voterId: number, targetUserId: number, voteType: string) {
    try {
      const userVotes = localStorage.getItem(`${this.USER_VOTES_KEY}_${voterId}`);
      const votes = userVotes ? JSON.parse(userVotes) : {};
      votes[targetUserId] = voteType;
      localStorage.setItem(`${this.USER_VOTES_KEY}_${voterId}`, JSON.stringify(votes));
    } catch (error) {
      console.error("Error saving user votes:", error);
    }
  }

  async getVoteStats(targetUserId: number, currentUserId?: number): Promise<PatologicalVoteStats> {
    const globalStats = this.getGlobalStats();
    const userStats = globalStats[targetUserId] || {
      antipato: 0,
      pato_no_tucupi: 0,
      patotastico: 0,
      votes: {},
    };

    const total = userStats.antipato + userStats.pato_no_tucupi + userStats.patotastico;

    const percentages = {
      antipato: total > 0 ? Math.round((userStats.antipato / total) * 1000) / 10 : 0,
      pato_no_tucupi: total > 0 ? Math.round((userStats.pato_no_tucupi / total) * 1000) / 10 : 0,
      patotastico: total > 0 ? Math.round((userStats.patotastico / total) * 1000) / 10 : 0,
    };

    const userVote = currentUserId ? this.getUserVote(currentUserId, targetUserId) : undefined;

    return {
      antipato: userStats.antipato,
      pato_no_tucupi: userStats.pato_no_tucupi,
      patotastico: userStats.patotastico,
      total,
      percentages,
      userVote,
    };
  }

  async vote(
    voterId: number,
    targetUserId: number,
    voteType: "antipato" | "pato_no_tucupi" | "patotastico"
  ): Promise<{ success: boolean; message: string }> {
    try {
      const globalStats = this.getGlobalStats();
      const userStats = globalStats[targetUserId] || {
        antipato: 0,
        pato_no_tucupi: 0,
        patotastico: 0,
        votes: {},
      };

      const previousVote = this.getUserVote(voterId, targetUserId);

      // Remove previous vote if exists
      if (previousVote && previousVote !== voteType) {
        const prevVoteKey = previousVote as keyof typeof userStats;
        if (prevVoteKey !== "votes") {
          userStats[prevVoteKey] = Math.max(0, userStats[prevVoteKey] - 1);
        }
      }

      // Add new vote if different from previous
      if (!previousVote || previousVote !== voteType) {
        userStats[voteType]++;
        userStats.votes[voterId] = voteType;
      } else {
        // Same vote - remove it (toggle)
        userStats[voteType] = Math.max(0, userStats[voteType] - 1);
        delete userStats.votes[voterId];
        this.saveUserVote(voterId, targetUserId, "");
      }

      // Save updated stats
      globalStats[targetUserId] = userStats;
      this.saveGlobalStats(globalStats);

      // Save user vote
      if (!previousVote || previousVote !== voteType) {
        this.saveUserVote(voterId, targetUserId, voteType);
      }

      return {
        success: true,
        message: "Voto computado com sucesso!",
      };
    } catch (error) {
      console.error("Error voting:", error);
      return {
        success: false,
        message: "Erro ao computar voto",
      };
    }
  }
}

export const patologicalVoteService = new PatologicalVoteService();
