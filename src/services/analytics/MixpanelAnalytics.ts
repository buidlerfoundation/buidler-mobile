import {getCategoryByApi, getEventNameByApi} from 'helpers/AnalyticHelper';
import {Mixpanel} from 'mixpanel-react-native';
import {UserData} from 'models';
import Config from 'react-native-config';

class MixpanelAnalytics {
  mixpanel = new Mixpanel(Config.MIXPANEL_TOKEN, true);
  init() {
    this.mixpanel.init();
  }

  identify(user: UserData) {
    this.mixpanel.identify(user.user_id);
    this.mixpanel.getPeople().set('name', user.user_name);
  }

  tracking(eventName: string, props: {[key: string]: string}) {
    this.mixpanel.track(eventName, props);
  }

  trackingError(
    apiUrl: string,
    method: string,
    errorMessage: string,
    statusCode: number,
    reqBody?: any,
  ) {
    this.tracking(getEventNameByApi(apiUrl, method, reqBody), {
      category: getCategoryByApi(apiUrl, method, reqBody),
      request_time: `${new Date().getTime()}`,
      url: apiUrl,
      error_code: `${statusCode}`,
      error_message: errorMessage,
    });
  }
}

export default new MixpanelAnalytics();
