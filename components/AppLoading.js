import React, {useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import Animated, {Easing} from 'react-native-reanimated';
import {loop, bInterpolate, runTiming} from 'react-native-redash';
import {useMemoOne} from 'use-memo-one';
import Logo from './Logo';

1;
import PropTypes from 'prop-types';
const {
  Value,
  Clock,
  useCode,
  set,
  block,
  cond,
  and,
  not,
  clockRunning,
  startClock,
  stopClock,
} = Animated;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function AppLoading() {
  const {isPlaying, animation, clock} = useMemoOne(
    () => ({
      isPlaying: new Value(1),
      animation: new Value(0),
      clock: new Clock(),
    }),
    [],
  );
  useCode(
    block([
      cond(and(not(clockRunning(clock)), isPlaying), startClock(clock)),
      cond(and(clockRunning(clock), not(isPlaying)), stopClock(clock)),
      set(
        animation,
        loop({
          clock,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          boomerang: true,
          autoStart: true,
        }),
      ),
    ]),
    [],
  );
  const scale = bInterpolate(animation, 0.4, 0.7);
  const rotate = bInterpolate(animation, 0, 2 * Math.PI * 2);
  const textScale = bInterpolate(animation, 0.4, 1);
  return (
    <View style={styles.container}>
      <Animated.View style={{transform: [{scale}, {rotate}]}}>
        <Logo />
      </Animated.View>
      <Animated.View style={{transform: [{scale}]}}>
        <Animated.Text
          style={{
            color: '#fff',
            marginTop: 10,
            fontWeight: 'bold',
            fontStyle: 'italic',
            fontSize: 50,
            textShadowOffset: {width: -2, height: -2},
            textShadowColor: 'rgba(0,0,0,0.75)',
            textShadowRadius: 10,
            fontFamily: 'Roboto:ital',
          }}>
          Xplore
        </Animated.Text>
      </Animated.View>
    </View>
  );
}
