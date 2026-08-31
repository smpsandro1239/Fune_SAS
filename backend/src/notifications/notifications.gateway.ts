import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

export interface NotificationEventPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  sentAt: Date;
}

@Injectable()
export class NotificationsGateway {
  private readonly emitter = new EventEmitter();
  private readonly EVENT = 'notification';

  onNotification(agencyId: string, handler: (payload: NotificationEventPayload) => void) {
    const wrapped = (payload: NotificationEventPayload) => {
      handler(payload);
    };
    this.emitter.on(`${this.EVENT}:${agencyId}`, wrapped);
    return {
      unsubscribe: () => {
        this.emitter.removeListener(`${this.EVENT}:${agencyId}`, wrapped);
      },
    };
  }

  publish(agencyId: string, payload: NotificationEventPayload) {
    this.emitter.emit(`${this.EVENT}:${agencyId}`, payload);
  }
}
