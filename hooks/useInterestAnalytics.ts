
import { useMemo } from 'react';
import { OfferLink, InterestLevel } from '../types';

export const useInterestAnalytics = (offers: OfferLink[]) => {
  const analytics = useMemo(() => {
    return offers.map(offer => {
      const views = offer.viewLog?.length || 0;
      const totalDurationMs = offer.viewLog?.reduce((acc, log) => acc + (log.durationMs || 0), 0) || 0;
      
      // Get last view time
      const lastViewTime = offer.viewLog?.length > 0 
        ? new Date(offer.viewLog[offer.viewLog.length - 1].timestamp).getTime()
        : 0;
      
      const hoursSinceLastView = lastViewTime ? (Date.now() - lastViewTime) / (1000 * 60 * 60) : 9999;

      // Scoring Algorithm
      // Base: 10 points per view, 1 point per second spent
      let score = (views * 10) + (totalDurationMs / 1000); 
      
      // Recency Multiplier: High impact for recent engagement
      if (hoursSinceLastView < 24) score *= 1.5;
      else if (hoursSinceLastView < 48) score *= 1.2;

      let interestLevel: InterestLevel = 'ice';
      if (score > 150) interestLevel = 'boiling';
      else if (score > 80) interestLevel = 'hot';
      else if (score > 30) interestLevel = 'neutral';

      return {
        offer,
        views,
        totalDurationMs,
        lastView: lastViewTime ? new Date(lastViewTime).toISOString() : null,
        interestLevel,
        score
      };
    }).sort((a, b) => b.score - a.score);
  }, [offers]);

  const stats = useMemo(() => {
    return {
      ice: analytics.filter(a => a.interestLevel === 'ice').length,
      neutral: analytics.filter(a => a.interestLevel === 'neutral').length,
      hot: analytics.filter(a => a.interestLevel === 'hot').length,
      boiling: analytics.filter(a => a.interestLevel === 'boiling').length,
    };
  }, [analytics]);

  return { analytics, stats };
};
