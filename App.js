/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  View,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Image,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Share,
  TextInput,
  Text,
  Platform,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {LinearGradient} from 'expo-linear-gradient';
import unsplash from './config/unsplash';
import CameraRoll from '@react-native-community/cameraroll';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Permissions, FileSystem} from 'react-native-unimodules';
import AppLoading from './components/AppLoading';
import axios from 'axios';
const {height, width} = Dimensions.get('window');

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      isloading: true,
      images: [],
      authors: [],
      isFocussed: false,
      scale: new Animated.Value(1),
      query: '',
      pageNo: 0,
      count: 10,
      connected: true,
    };
    this.CheckConnectivity();
    this.scale = {
      transform: [{scale: this.state.scale}],
    };
    this.searchBarY = this.state.scale.interpolate({
      inputRange: [0.8, 1],
      outputRange: [+70, -70],
    });
    this.actionBarY = this.state.scale.interpolate({
      inputRange: [0.8, 1],
      outputRange: [height, height * 1.18],
    });
    this.descriptionBarY = this.state.scale.interpolate({
      inputRange: [0.8, 1],
      outputRange: [height + 100, height - 100],
    });
  }

  componentDidMount() {
    setTimeout(async () => {
      this.setState({isloading: false});
    }, 4000);

    this.loadWallpapers();
  }

  CheckConnectivity = () => {
    // For Android devices
    if (Platform.OS === 'android') {
      NetInfo.fetch().then((state) => {
        if (state.isConnected) {
          this.state.connected = true;
        } else {
          this.state.connected = false;
        }
      });
    } else {
      // For iOS devices
      NetInfo.isConnected.addEventListener(
        'connectionChange',
        this.handleFirstConnectivityChange,
      );
    }
  };

  handleFirstConnectivityChange = (isConnected) => {
    NetInfo.isConnected.removeEventListener(
      'connectionChange',
      this.handleFirstConnectivityChange,
    );
    this.state.connected = isConnected;
  };
  loadWallpapers = async (term = ' ') => {
    // axios
    //   .get('https://api.unsplash.com/search/photos', {
    //     params: {query: term},
    //     headers: {
    //       Authorization:
    //         'Client-ID KG3JB6gQQy3p-JIDG2CijXvCTp_Ztu7WMGPp6MdN3AA',
    //     },
    //   })
    // alert('images loaded');
    let response;
    if (term !== ' ') {
      this.setState({pageNo: this.state.pageNo + 1});
      response = await unsplash.get('search/photos', {
        params: {
          query: term,
          page: this.state.pageNo,
          per_page: this.state.count,
          // content_filter: 'high',
          order_by: 'relevant',
        },
      });
      this.setState({images: response.data.results});
    } else {
      this.setState({pageNo: this.state.pageNo + 1});
      response = await axios.get('https://api.unsplash.com/photos/random', {
        headers: {
          Authorization:
            'Client-ID KG3JB6gQQy3p-JIDG2CijXvCTp_Ztu7WMGPp6MdN3AA',
        },
        params: {
          page: this.state.pageNo,
          count: this.state.count,
          content_filter: 'high',
        },
      });
      this.setState({images: response.data, pageNo: 0});
      
    }
  };

  showControls = (item) => {
    this.setState(
      (state) => ({
        isFocussed: !state.isFocussed,
      }),
      () => {
        if (this.state.isFocussed) {
          Animated.spring(this.state.scale, {
            toValue: 0.8,
            useNativeDriver: 'true',
          }).start();
        } else {
          Animated.spring(this.state.scale, {
            toValue: 1,
            useNativeDriver: 'true',
          }).start();
        }
      },
    );
  };
  saveToCameraRoll = async (item) => {
    let cameraPermissions = await Permissions.getAsync(Permissions.CAMERA_ROLL);
    if (cameraPermissions.status !== 'granted') {
      cameraPermissions = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    } else if (cameraPermissions.status === 'granted') {
      FileSystem.downloadAsync(
        item.urls.regular,
        FileSystem.documentDirectory + item.id + '.jpg',
      )
        .then(({uri}) => {
          CameraRoll.saveToCameraRoll(uri);
          alert('Saved to photos');
        })
        .catch((err) => {
          console.log(err.message);
        });
    } else {
      alert('permissions needed');
    }
  };
  shareWallpaper = async (image) => {
    const shareOPtions = {
      message: 'Checkout this wallpaper \n' + image.urls.full,
    };
    try {
      await Share.share(shareOPtions);
    } catch (err) {
      console.log(err);
    }
  };

  EmptyItems = () => {
    this.CheckConnectivity();
    return !this.state.connected ? (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          width: width,
        }}>
        <ActivityIndicator color="grey" size="large" />
        <Text style={{color: 'white'}}>
          There seems to be an internet issue{' '}
        </Text>
        <TouchableOpacity
          activeOpacity={0.5}
          style={{
            marginVertical: 10,
            padding: 5,
            paddingHorizontal: 10,
            backgroundColor: 'white',
            borderRadius: 10,
          }}
          onPress={() => {
            this.CheckConnectivity;
            this.loadWallpapers();
            console.log('pressed');
          }}>
          <Text style={{color: 'black', fontWeight: 'bold'}}>Try Again</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          height: height,
          width: width,
        }}>
        <ActivityIndicator color="grey" size="large" />
        <Text style={{color: 'white'}}>Oops!! Image Not Found </Text>

        <TouchableOpacity
          activeOpacity={0.5}
          style={{
            marginVertical: 10,
            padding: 5,
            paddingHorizontal: 10,
            backgroundColor: 'white',
            borderRadius: 10,
          }}
          onPress={() => {
            this.loadWallpapers();
            console.log('pressed');
          }}>
          <Text style={{color: 'black', fontWeight: 'bold'}}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  };
  scrollToInitial = () => {
    this.flatListRef.refreshing = true;
    this.flatListRef.scrollToIndex({animated: true, index: 0});
  };
  renderItem = ({item}) => {
    return (
      <View style={{flex: 1}}>
        <Animated.View
          style={{
            position: 'absolute',
            top: -50,
            translateY: this.searchBarY,
          }}>
          <TextInput
            placeholder="Search"
            style={{
              height: 50,
              borderRadius: 20,
              borderWidth: 0.75,
              borderColor: 'white',
              color: 'white',
              paddingHorizontal: 20,
              width: width - 40,
              marginHorizontal: 20,
            }}
            value={this.state.query}
            autoCorrect
            importantForAutofill="auto"
            keyboardType="email-address"
            maxLength={100}
            placeholderTextColor="grey"
            selectionColor="grey"
            inlineImageLeft="search1"
            onChangeText={(text) => {
              this.setState({query: text});
            }}
            onSubmitEditing={(event) => this.loadWallpapers(this.state.query)}
          />
        </Animated.View>
        <View
          style={{
            position: 'absolute',
            top: 30,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator color="grey" size="large" />
        </View>
        <TouchableWithoutFeedback onPress={() => this.showControls(item)}>
          <Animated.View style={[{height, width}, this.scale]}>
            <Image
              style={{
                flex: 1,
                height: null,
                width: null,
                borderRadius: this.state.isFocussed ? 30 : 10,
                marginTop: 20,
                marginHorizontal: 5,
                shadowColor: 'white',
                shadowOpacity: 1,
                shadowRadius: 5,
                shadowOffset: {
                  width: 4,
                  height: 16,
                },
              }}
              source={{uri: item.urls.regular}}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <Animated.View
          style={{
            position: 'absolute',
            translateY: this.descriptionBarY,
            marginHorizontal: 5,
            // paddingHorizontal:10
          }}>
          <Text style={{color: 'white', opacity: 1, paddingHorizontal: 10}}>
            {item.user.name}
          </Text>
          <Animated.View
            style={{
              height: height * 0.2,
              width: width,
              backgroundColor: 'black',
              borderRadius: 10,
              opacity: 0.5,
            }}>
            <Text style={{color: 'white', zIndex: 5, paddingHorizontal: 10}}>
              {'Description:'}
            </Text>
            <Text style={{color: 'white', paddingHorizontal: 10}}>
              {item.alt_description}
            </Text>
          </Animated.View>
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            translateY: this.actionBarY,
            left: 0,
            right: 0,
            height: height * 0.08,
            backgroundColor: '#282828', //#1b1811
            borderRadius: 5,
            shadowColor: 'white',
            shadowRadius: 20,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                this.setState({query: ''});
                this.loadWallpapers();
              }}>
              <Icon name="refresh" color="#e8e6e2" size={40} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => this.saveToCameraRoll(item)}>
              <Icon name="download" color="#e8e6e2" size={40} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => this.shareWallpaper(item)}>
              <Icon name="share" color="#e8e6e2" size={40} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };

  render = () => {
    return this.state.isloading ? (
      <View style={{flex: 1}}>
        <LinearGradient style={{flex: 1}} colors={['#C33764', '#1D2671']}>
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <AppLoading />
          </View>
        </LinearGradient>
      </View>
    ) : (
      <View style={{flex: 1, backgroundColor: '#00112c'}}>
        <FlatList
          ref={(ref) => {
            this.flatListRef = ref;
          }}
          scrollEnabled={!this.state.isFocussed}
          horizontal
          pagingEnabled
          ListEmptyComponent={this.EmptyItems}
          data={this.state.images}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.id}
          ListFooterComponent={
            this.state.images.length !== 0 ? (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: height,
                  width: width,
                  backgroundColor: 'transparent',
                }}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  style={{
                    padding: 5,
                    paddingHorizontal: 10,
                    backgroundColor: 'white',
                    borderRadius: 10,
                  }}
                  onPress={() => {
                    this.loadWallpapers();
                    this.state.loaded = true;
                    this.scrollToInitial();
                  }}>
                  <Text style={{color: 'black', fontWeight: 'bold'}}>
                    Load Few More
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View />
            )
          }
        />
      </View>
    );
  };
}
