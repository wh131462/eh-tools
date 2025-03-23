import Taro from '@tarojs/taro';

interface AdEvent {
  type: 'splash' | 'banner' | 'video';
  action: 'show' | 'click' | 'close' | 'error';
  unitId: string;
  timestamp: number;
  error?: any;
}

class AdAnalytics {
  private static events: AdEvent[] = [];
  private static readonly MAX_EVENTS = 100;

  static trackEvent(event: AdEvent) {
    this.events.push(event);
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }
    console.log('Ad Event:', event);
    
    // 可以在这里添加上报逻辑
    try {
      Taro.reportAnalytics('ad_event', {
        type: event.type,
        action: event.action,
        unit_id: event.unitId,
        timestamp: event.timestamp
      });
    } catch (error) {
      console.error('Report analytics error:', error);
    }
  }

  static getEvents() {
    return this.events;
  }

  static clearEvents() {
    this.events = [];
  }
}

export default AdAnalytics;