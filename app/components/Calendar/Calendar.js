import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { Button } from 'react-native-elements';
import styles from './styles/styles.js';
import * as Animatable from 'react-native-animatable';
import {pullFromDataBase, pullMedicineFromDatabase} from '../../databaseUtil/databaseUtil';
import constants from '../Resources/constants';
import {getColor, getTranslucentColor} from '../Resources/constants';
import SelectedIndicator from './SelectedIndicator/SelectedIndicator';
import PickerInputType from '../LogInputTypes/PickerInputType'
import NumericalPickerInputType from '../LogInputTypes/NumericalPickerInputType'
const { width } = Dimensions.get("window");
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Calendar extends PureComponent {
    static propTypes = {
      currMonth: PropTypes.object,
      onPressMonth: PropTypes.func,
      pickerHandler: PropTypes.func,
    };


    constructor(props){
        super(props)

        let backgroundColor = [];

        this.today = this.props.currMonth;
        this.numberOfDays = new Date(this.today.getFullYear(), this.today.getMonth()+1, 0).getDate();

        for (var i = 0; i < this.numberOfDays; i++){
            backgroundColor.push(0);
        }

        var dot1 = [];
        var dot2 = [];
        var dot3 = [];
        var baseBars = [];

        for (var i = 0; i < this.numberOfDays; i++){
            dot1[i] = styles.generic;
            dot2[i] = styles.generic;
            dot3[i] = styles.generic;
            baseBars[i] = styles.baseBar;
        }



        this.state = {
            currentDate: undefined,
            backgroundColor: backgroundColor,
            selected: -1,
            dot1: dot1,
            dot2: dot2,
            dot3: dot3,
            graphColor: 'rgba( 0, 0, 0, 0)',
            intensities: [0,0],
            baseBars: baseBars,
            modalVisible: false,
        }

        this.graphRefs = [];
        this._isMounted = false;
        this.monthPicker = [];
        this.yearPicker = [];
        this._onDatePress = this._onDatePress.bind(this);
    }

    componentDidMount() {
      this._isMounted = true;

      if(this._isCurrMonth()){
        this._onDatePress((new Date()).getDate() - 1)
      }

      //console.log('mounted', this.props.currMonth)
      this.initVisualization();
    }

    _isCurrMonth(){ //to initialize selection to 'today'
      let d = new Date()
      return (d.getFullYear() == this.props.currMonth.getFullYear() && d.getMonth() == this.props.currMonth.getMonth())
    }
    componentWillUnmount() {
      this._isMounted = false;
      //console.log('unmounted', this.props.currMonth)
    }



/**    componentDidUpdate(){
      console.log('UPDATE')
    }

    shouldComponentUpdate(nextProps, nextState){
      return false;//console.log("UPDATING", nextProps, nextState)
    }
*/

    /** Pulls symptom data from storage and initilizes the calendar. Optional parameter to see a particular
    *  graph first. */
    initVisualization = (type) => {
      pullFromDataBase(this.props.currMonth, null, data => {
        let dot1 = [];
        let dot2 = [];
        let dot3 = [];
        for (var i = 0; i < this.numberOfDays; i++){
            dot1[i] = styles.generic;
            dot2[i] = styles.generic;
            dot3[i] = styles.generic;
        }
        let firstIntensities;
        let firstColor;
        let first = true;
        Object.keys(data).forEach(function(key) {
          if(first){
            first = false;
            firstColor = getTranslucentColor(key);
            firstIntensities = data[key].intensities;
          }
          if(type == key){//use color and intensity graph of input param type
            firstColor = getTranslucentColor(key);
            firstIntensities = data[key].intensities;
          }
          //Set Dots
          data[key].intensities.map((val, j) => {
            let tempStyle;
            let backColor = getColor(key)
            tempStyle = [{backgroundColor: backColor}, styles.dot]

            if(val != undefined){
              if(dot1[j] == styles.generic){
                dot1[j] = tempStyle;
              } else if(dot2[j] == styles.generic){
                dot2[j] = tempStyle;
              } else if(dot3[j] == styles.generic){
                dot3[j] = tempStyle;
              }
            }

          });

        });

        this.setState({
          dot1: dot1,
          dot2: dot2,
          dot3: dot3,
          graphColor: firstColor,
          intensities: firstIntensities,
        });

      });

    }

    updateVisualization = (type) => {
      var graphRefs = this.graphRefs;
      var thisRef = this; //reference to this lost on callback

      pullFromDataBase(this.props.currMonth, null, data => {
        Object.keys(data).forEach(function(key) {
          if(key == type){
            let color = getTranslucentColor(type);
            let last = graphRefs.length-1;
            while(last > -1  && graphRefs[last] == undefined){
              last--;
            }
            for(var j=0; j<graphRefs.length; j++){

              if(graphRefs[j]){
                graphRefs[j].transitionTo({bottom: -31.3}, 200, 'ease');
                if(j == last){
                  setTimeout(()=> {
                    thisRef.setState({
                      graphColor: color,
                      intensities: data[key].intensities,
                    }, function(){
                      graphRefs.forEach(function(g) {
                        if(g){
                          g.transitionTo({bottom: 0}, 400, 'ease');
                        }
                      });
                    });
                  }, 200)
                }
              }
            }
            return;

          }
        })
      });
    }


    _onDatePress = (i) => {
        let backgroundColor = [];
        backgroundColor[i] = 1;

        let dot1 = this.state.dot1;
        let dot2 = this.state.dot2;
        let dot3 = this.state.dot3;
        let baseBars = this.state.baseBars;

        /**
        for (var j = 0; j < this.numberOfDays; j++){
          if (dot1[j] == styles.genericGray){
            dot1[j] = styles.generic
          }
          if (dot2[j] == styles.genericGray){
            dot2[j] = styles.generic
          }
          if (dot3[j] == styles.genericGray){
            dot3[j] = styles.generic
          }
          if(baseBars[j] == styles.baseBarSelected){
            baseBars[j] = styles.baseBar
          }
        }
        */
        this._clearSelection();
        /**
        if (dot1[i] == styles.generic){
          dot1[i] = styles.genericGray
        }
        if (dot2[i] == styles.generic){
          dot2[i] = styles.genericGray
        }
        if (dot3[i] == styles.generic){
          dot3[i] = styles.genericGray
        }
        if(baseBars[i] == styles.baseBar){
          baseBars[i] = styles.baseBarSelected
        }
        */
        let currentDate = new Date(this.today.getFullYear(), this.today.getMonth(), i+1)

        this.setState({ selected: i });
        this.setState({ backgroundColor });
        this.setState({ dot1 })
        this.setState({ dot2 })
        this.setState({ dot3 })
        this.setState({ baseBars })
        this.setState({ currentDate}, function(){
          this.props.onPressMonth(this, i)
        })

    }

    _clearSelection = () => {
      if(this.state.selected != -1){

        let dot1 = this.state.dot1;
        let dot2 = this.state.dot2;
        let dot3 = this.state.dot3;
        let baseBars = this.state.baseBars;
        let backgroundColor = this.state.backgroundColor;

        backgroundColor[this.state.selected] = 0;

        if (dot1[this.state.selected] == styles.genericGray){
          dot1[this.state.selected] = styles.generic
        }
        if (dot2[this.state.selected] == styles.genericGray){
          dot2[this.state.selected] = styles.generic
        }
        if (dot3[this.state.selected] == styles.genericGray){
          dot3[this.state.selected] = styles.generic
        }
        if(baseBars[this.state.selected] == styles.baseBar){
          baseBars[this.state.selected] = styles.baseBarSelected
        }

        baseBars[this.state.selected] = styles.baseBar


        this.setState({
          backgroundColor: backgroundColor,
          dot1: dot1,
          dot2: dot2,
          dot3: dot3,
          baseBars: baseBars,
          selected: -1
        })
      }
    }

    _onTitlePress = () => {
      this.setState({
        modalVisible: true,
      })
    }

    _onHeadachePress = () => {
      let circles  = this.state.dot1;
      circles[this.state.selected] = styles.headache;

      this.setState({ dot1: circles });
    }

    _onBlurredPress = () => {
      let circles = this.state.dot2;
      circles[this.state.selected] = styles.blurred;

      this.setState({ dot2: circles });
    }

    _onPillPress = () => {
      let circles = this.state.dot3;
      circles[this.state.selected] = styles.pill;

      this.setState({ dot3: circles });
    }

    dateStyle = function(i) {
        return {
            margin: 2,
            width: Dimensions.get('window').width / 7 -9,
            justifyContent: 'center',
            alignItems: 'center',
            height: 43,
            backgroundColor: this.state.backgroundColor[i],
        }
    }

    renderWeek() {
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        return days.map((day) => {
                if (day == 'SUN'){
                    return <View  key={day} style={styles.weekItem}><Text style= {styles.weekAlt}>{day}</Text></View>
                }
                else{
                    return <View key={day} style={styles.weekItem}><Text style= {styles.week}>{day}</Text></View>
                }
            }
            );
        };

    renderMonth() {
        return monthNames[this.today.getMonth()];
    }

    renderYear() {
        return this.today.getFullYear();
    }

    renderDates() {
        const days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
        var last = new Date(this.today.getFullYear(), this.today.getMonth(), this.numberOfDays);

        var dateGrid = days.slice(0, this.numberOfDays);



        return dateGrid.map((day, i) => {
            //let dateStyle = this.state.backgroundColor[i] ? styles.altItem : styles.item
            //let textStyle = this.state.backgroundColor[i] ? styles.altDate : styles.date
            let dateStyle = styles.item
            let textStyle = styles.date
            let selectedIndicator = this.state.backgroundColor[i] ? (<SelectedIndicator/>):(null);

            var barHolder = [];
            let h = 0;
            if(this.state.intensities){
              h = 2.83*(this.state.intensities[i] || 0);
            }

            return(
                <TouchableOpacity style = {dateStyle} key = {i} onPress={() => this._onDatePress(i)}>
                  <View style={styles.textBox}>
                    <Text style={textStyle}>
                        {day}
                    </Text>
                  </View>
                  <View style={styles.dayBox}>
                      <Animatable.View
                        ref={(b) => {this.graphRefs[i] = b;}}
                        duration={400}
                        animation="slideInUp"
                        style={[{backgroundColor: this.state.graphColor, height: h}, styles.bar]}
                      />
                      <View style={this.state.baseBars[i]} >
                        <View style = {styles.circles}>
                            <View style = {this.state.dot1[i]} />
                            <View style = {this.state.dot2[i]} />
                            <View style = {this.state.dot3[i]} />
                        </View>
                      </View>
                  </View>
                {selectedIndicator}
              </TouchableOpacity>
            );
        });

    }

    renderPreviousDates() {
        const days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
        var first = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
        var firstDays = new Date(this.today.getFullYear(), this.today.getMonth(), 0).getDate();


        if (first.getDay() != 0){
            var previousGrid = days.slice(firstDays - first.getDay(), firstDays);
        }
        if(previousGrid){
            return previousGrid.map((day, i) => {
                return(
                    <View style = {styles.item}  key={i}>
                      <View style={styles.textBox}>
                        <Text style={styles.dateGray}>
                            {day}
                        </Text>
                      </View>
                      <View style={styles.dayBox}>
                          <View style={this.state.baseBar} />
                      </View>
                    </View>

                )
            })
        }
    }

    renderNextDates() {
        const days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
        var last = new Date(this.today.getFullYear(), this.today.getMonth(), this.numberOfDays);

        if (last.getDay() != 6){
            var nextGrid = days.slice(0, 6 - last.getDay());
        }
        if(nextGrid){
            return nextGrid.map((day, i) => {
                return(
                    <View style = {styles.item} key={i}>
                      <View style={styles.textBox}>
                        <Text style={styles.dateGray}>
                            {day}
                        </Text>
                      </View>
                      <View style={styles.dayBox}>
                          <View style={this.state.baseBar} />
                      </View>
                    </View>
                )
            })
      }
    }

    _renderItem ({item, index}) {
      return (
          <View style={styles.slide}>
              <Text style={styles.title}>{ item.title }</Text>
          </View>
      );
    }

    render() {
        return (
            <View style = {{flex: 1}}>
              <View style= {styles.head}>
                <TouchableOpacity onPress = {this._onTitlePress.bind(this)}>
                    <View style= {styles.header}>
                        <Text style= {styles.month}> { this.renderMonth() }</Text>
                        <Text style= {styles.year}> {this.renderYear() }</Text>
                    </View>
                </TouchableOpacity>

                <View style= {styles.header2}>
                    { this.renderWeek() }
                </View>
              </View>

              <View style = {styles.tiles}>
                  { this.renderPreviousDates() }
                  { this.renderDates() }
                  { this.renderNextDates() }
              </View>

              <Modal
                onBackdropPress={() => this.setState({ modalVisible: false })}
                isVisible={this.state.modalVisible}
                style={{ flex: 1}}
                backdropOpacity={0.9}
                animationOutTiming={600}
                animationInTiming={600}
              >
                  <View
                    style={{
                      justifyContent: 'center',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: Dimensions.get('window').height/2,
                      marginBottom: 20,
                    }}
                  >
                   <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                   >
                    <PickerInputType
                      ref={(m) => {this.monthPicker = m;}}
                      input_style={{ width: 100 }}
                      title_text_style={{
                        color: 'white'
                      }}
                      value={monthNames[this.props.currMonth.getMonth()]}
                      picker_values={monthNames}
                      title_text={''}
                      handleChange={() => {}}
                    />
                    <NumericalPickerInputType
                      ref={(y) => {this.yearPicker = y;}}
                      input_style={{ width: 120 }}
                      title_text_style={{ color: 'white'}}
                      value={this.props.currMonth.getFullYear()}
                      min={1970}
                      max={this.props.currMonth.getFullYear()+1000}
                      unit={''}
                      title_text={''}
                      val_label={[]}
                      valueChange={() => {}}
                    />
                  </View>
                  <View
                   style={{
                     flex: 1,
                     flexDirection: 'row',
                     justifyContent: 'center',
                     marginTop: 80,
                   }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        this.props.pickerHandler(monthNames.indexOf(this.monthPicker.state.value)+1, this.yearPicker.picker.state.value);
                        this.setState({
                          modalVisible: false,
                        })
                      }}>
                      <Text style={styles.modalButton}>Select</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({
                          modalVisible: false,
                        })
                      }}>
                      <Text style={styles.modalButton}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>

        );
    }
}

export default Calendar;