import React from "react";
import { View } from "react-native";
import MenuBar from "./components/MenuBar/MenuBar";
import OnboardContent from "./components/Onboard/OnboardContent";
import {
  createTables,
  intializeDatabase,
  pullIsFirstFromDatabase,
  logIsFirst,
  databaseFakeData
} from "./databaseUtil/databaseUtil";
import { cancelAllNotifications } from "./components/PushController/PushController";

class main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      verified: false,
      isOnboarded: -1 //-1 if not known yet. 1 : true, 0, false
    };

    createTables();
    intializeDatabase();
    pullIsFirstFromDatabase(is_f => {
      if (is_f) {
        cancelAllNotifications();
      }
      this.setState({ isOnboarded: is_f ? 0 : 1 });
    });

    const uuid = require('uuid/v4')()     // random unique id number
  }

  render() {
    let mainScreen;
    switch (this.state.isOnboarded) {
      case 1:
        mainScreen = <MenuBar />;
        break;
      case 0:
        mainScreen = (
          <OnboardContent
            onComplete={() => {
              logIsFirst();
              this.setState({ isOnboarded: 1 });
            }}
          />
        );
        break;
      default:
        mainScreen = <View style={{ flex: 1, backgroundColor: "#21242a" }} />;
    }

    return mainScreen;
  }
}

export default main;
