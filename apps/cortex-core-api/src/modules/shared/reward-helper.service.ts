import { Injectable } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class RewardHelper {
  constructor(private eventsGateway: EventsGateway) {}

  /**
   * Triggers a visual and audio reward effect on the client apps
   */
  triggerMilestoneReward(
    userId: string,
    milestoneName: string,
    xpEarned: number,
  ) {
    const payload = {
      userId,
      milestoneName,
      xpEarned,
      effect: 'confetti',
      sound: 'milestone_achieved',
      timestamp: new Date(),
    };

    // Broadcast to the ecosystem
    this.eventsGateway.broadcastEvent('ecosystem:milestone_reached', payload);

    // Also send directly to the user if they are connected
    this.eventsGateway.sendToUser(userId, 'user:milestone_reward', payload);
  }
}
