import React from 'react';
import PainForm from './components/screens/PainForm';
import FlatListCard from './components/screens/FlatListCard';
import MenuBar from './components/MenuBar/MenuBar';
import { StackNavigator } from 'react-navigation';
import { View, NavigatorIOS, StatusBar } from 'react-native';
import {
  createTables,
  intializeDatabase,
  databaseFakeData
} from './databaseUtil/databaseUtil';

class main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      verified: false
    };

    createTables();
    intializeDatabase();
    databaseFakeData();
  }
  componentDidMount() {}
  render() {
    return <MenuBar />;
  }
}

export default main;
