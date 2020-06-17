import React, {useState} from 'react';
import {View} from 'react-native';
import Logo from './Logo';
import Animated, {Easing, Clock} from 'react-native-reanimated';
import {loop, bInterpolate, boomerang} from 'react-native-redash';
// import Clock from 'react-clock'
const {Value, useCode, set} = Animated;
const AppLoading = () => {
  const [expanded, expand] = useState(false);
  const clock = new Clock();
  const animation = new Value(expanded ? 1 : 0);
  useCode(
    set(
      animation,
      loop({
        clock,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        bomerang: true,
      }),
    ),
    [animation],
  );

  const rotate = bInterpolate(animation, 0, 2 * Math.PI * 2);
  const scale = bInterpolate(animation, 0.4, 0.7);
  return (
    <View
      onResponderStart={() => {
        expand(!expanded);
      }}>
      <Animated.View style={{transform: [{scale}, {rotate}]}}>
        <Logo />
      </Animated.View>
    </View>
  );
};

export default AppLoading;
