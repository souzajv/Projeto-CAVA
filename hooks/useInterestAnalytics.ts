
import { useMemo } from 'react';
import { OfferLink, InterestLevel } from '../types';

export const useInterestAnalytics = (offers: OfferLink[]) => {
  const analytics = useMemo(() => {
    return offers.map(offer => {
      const views = offer.viewLog?.length || 0;
      const totalDurationMs = offer.viewLog?.reduce((acc, log) => acc + (log.durationMs || 0), 0) || 0;
      
      const lastViewTime = offer.viewLog?.length > 0 
        ? new Date(offer.viewLog[offer.viewLog.length - 1].timestamp).getTime()
        : 0;
      
      const hoursSinceLastView = lastViewTime ? (Date.now() - lastViewTime) / (1000 * 60 * 60) : 9999;

      // New Scoring Logic for 3 levels
      // Base: 15 points per view, 1 point per second spent
      let score = (views * 15) + (totalDurationMs / 1000); 
      
      if (hoursSinceLastView < 24) score *= 1.5;
      else if (hoursSinceLastView < 48) score *= 1.2;

      let interestLevel: InterestLevel = 'cold';
      
      // Hot: > 7 clicks OR > 2 mins (approx 120 points base)
      if (score > 120) interestLevel = 'hot';
      // Warm: > 3 clicks OR > 30s (approx 45 points base)
      else if (score > 45) interestLevel = 'warm';

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
      cold: analytics.filter(a => a.interestLevel === 'cold').length,
      warm: analytics.filter(a => a.interestLevel === 'warm').length,
      hot: analytics.filter(a => a.interestLevel === 'hot').length,
    };
  }, [analytics]);

  return { analytics, stats };
};
