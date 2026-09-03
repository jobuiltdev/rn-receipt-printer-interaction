import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, Extrapolation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { palette } from '../theme';
import type { PaymentStage } from '../types';
import { Receipt } from './Receipt';

const PAPER_HEIGHT = 390;
const HIDDEN = -PAPER_HEIGHT - 16;
const TEAR_DISTANCE = 96;
type Props = { stage: PaymentStage; reduceMotion: boolean; onPrinted: () => void; onDetached: () => void };

function haptic(kind: 'success' | 'feed' | 'threshold' | 'tear') {
  if (Platform.OS === 'web') return;
  if (kind === 'success') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  if (kind === 'feed' || kind === 'threshold') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  if (kind === 'tear') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export function ReceiptPrinter({ stage, reduceMotion, onPrinted, onDetached }: Props) {
  const printY = useSharedValue(HIDDEN);
  const pullY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const lift = useSharedValue(0);
  const exit = useSharedValue(0);
  const threshold = useSharedValue(false);
  const locked = useSharedValue(false);
  const run = useRef(0);

  useEffect(() => {
    if (stage === 'checkout') {
      run.current += 1; printY.value = HIDDEN; pullY.value = 0; rotate.value = 0; lift.value = 0; exit.value = 0; threshold.value = false; locked.value = false;
    }
    if (stage === 'approved') {
      const id = ++run.current;
      haptic('success');
      printY.value = withDelay(reduceMotion ? 40 : 260, withTiming(8, { duration: reduceMotion ? 220 : 1550, easing: Easing.bezier(0.18, 0.74, 0.22, 1) }, done => done && runOnJS(onPrinted)()));
      if (!reduceMotion) {
        setTimeout(() => id === run.current && haptic('feed'), 650);
        setTimeout(() => id === run.current && haptic('feed'), 1080);
      }
    }
    if (stage === 'ready' && !reduceMotion) lift.value = withSequence(withDelay(300, withTiming(-7, { duration: 180 })), withSpring(0, { damping: 12, stiffness: 170 }));
  }, [stage, reduceMotion, onPrinted, printY, pullY, rotate, lift, exit, threshold, locked]);

  const pan = Gesture.Pan().enabled(stage === 'ready').activeOffsetY(5).failOffsetX([-48, 48])
    .onUpdate(event => {
      if (locked.value) return;
      const distance = Math.max(0, event.translationY);
      pullY.value = interpolate(distance, [0, TEAR_DISTANCE, 190], [0, 77, 112], Extrapolation.CLAMP);
      rotate.value = interpolate(event.translationX, [-110, 110], [-2.8, 2.8], Extrapolation.CLAMP);
      if (distance >= TEAR_DISTANCE && !threshold.value) { threshold.value = true; runOnJS(haptic)('threshold'); }
      if (distance < TEAR_DISTANCE - 15) threshold.value = false;
    })
    .onEnd(event => {
      if (locked.value) return;
      if (event.translationY >= TEAR_DISTANCE || event.velocityY > 900) {
        locked.value = true; runOnJS(haptic)('tear');
        pullY.value = withTiming(pullY.value + 18, { duration: reduceMotion ? 0 : 80, easing: Easing.out(Easing.quad) });
        rotate.value = withTiming(rotate.value + 1.4, { duration: reduceMotion ? 0 : 90 });
        exit.value = withDelay(reduceMotion ? 0 : 130, withTiming(1, { duration: reduceMotion ? 0 : 360, easing: Easing.in(Easing.cubic) }, done => done && runOnJS(onDetached)()));
      } else {
        threshold.value = false;
        pullY.value = withSpring(0, { damping: 18, stiffness: 240, mass: 0.7 });
        rotate.value = withSpring(0, { damping: 18, stiffness: 210 });
      }
    });

  const paperStyle = useAnimatedStyle(() => ({
    opacity: interpolate(exit.value, [0, 0.75, 1], [1, 1, 0]),
    transform: [{ translateY: printY.value + pullY.value + lift.value + interpolate(exit.value, [0, 1], [0, 210]) }, { rotate: `${rotate.value + interpolate(exit.value, [0, 1], [0, 4])}deg` }, { scale: interpolate(exit.value, [0, 1], [1, 0.93]) }],
    shadowOpacity: interpolate(pullY.value, [0, 77], [0.18, 0.46]),
  }));
  const progressStyle = useAnimatedStyle(() => ({ width: `${interpolate(printY.value, [HIDDEN, 8], [0, 100])}%` }));
  const tearStyle = useAnimatedStyle(() => ({ opacity: interpolate(pullY.value, [16, 70], [0, 1]), transform: [{ scaleX: interpolate(pullY.value, [16, 77], [0.6, 1]) }] }));
  const isProcessing = stage === 'processing';
  const isApproved = ['approved', 'ready'].includes(stage);

  return <View style={styles.container} accessibilityLabel={stage === 'ready' ? 'Receipt ready. Pull down to tear off.' : undefined}>
    <View style={styles.deviceShadow} />
    <View style={styles.device}>
      <View style={styles.cap}><View style={styles.capLine} /></View>
      <View style={styles.deviceFace}>
        <View style={styles.screen}>
          {stage === 'checkout' && <><View style={styles.tapGlyph}><Text style={styles.tapGlyphText}>)))</Text></View><Text style={styles.screenTitle}>Ready to pay</Text><Text style={styles.screenSub}>Tap Pay below</Text></>}
          {isProcessing && <><View style={styles.spinner}><View style={styles.spinnerTip} /></View><Text style={styles.screenTitle}>Processing</Text><Text style={styles.screenSub}>Please wait</Text></>}
          {isApproved && <><View style={styles.approvedRing}><Text style={styles.approvedCheck}>✓</Text></View><Text style={styles.approvedTitle}>Approved</Text><Text style={styles.screenSub}>{stage === 'approved' ? 'Printing receipt' : 'Take your receipt'}</Text></>}
        </View>
        <View style={styles.deviceMeta}><Text style={styles.deviceBrand}>FIELD</Text><View style={[styles.light, isApproved && styles.lightOn]} /></View>
      </View>
      <View style={styles.slotFrame}><View style={styles.slotInner} /><Animated.View style={[styles.feedProgress, progressStyle]} /></View>
      <View style={styles.footLeft} /><View style={styles.footRight} />
    </View>
    <View style={styles.paperViewport} pointerEvents="box-none">
      <GestureDetector gesture={pan}><Animated.View style={[styles.paper, paperStyle]}>
        <Receipt />
        <Animated.View pointerEvents="none" style={[styles.tearLine, tearStyle]}><View style={styles.tearGrip} /></Animated.View>
      </Animated.View></GestureDetector>
    </View>
    <View style={styles.slotMask} pointerEvents="none" />
  </View>;
}

const styles = StyleSheet.create({
  container: { width: '100%', height: 500, alignItems: 'center' }, deviceShadow: { position: 'absolute', top: 31, width: 286, height: 194, borderRadius: 44, backgroundColor: '#000', opacity: 0.7, transform: [{ scaleX: 1.04 }], shadowColor: '#000', shadowOpacity: 0.8, shadowRadius: 28, elevation: 20 },
  device: { zIndex: 4, width: 286, height: 216, borderRadius: 39, backgroundColor: '#20231F', borderWidth: 1, borderColor: '#3B3F39', padding: 13, shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.55, shadowRadius: 24, elevation: 18 },
  cap: { height: 26, borderRadius: 16, backgroundColor: '#30342E', borderWidth: 1, borderColor: '#42463F', justifyContent: 'center', paddingHorizontal: 18 }, capLine: { height: 2, borderRadius: 1, backgroundColor: '#171916' }, deviceFace: { marginTop: 10, height: 135, borderRadius: 25, backgroundColor: '#121411', borderWidth: 1, borderColor: '#090A09', padding: 9 },
  screen: { flex: 1, borderRadius: 18, backgroundColor: '#080A08', borderWidth: 1, borderColor: '#292D27', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#F2F1EC', fontSize: 12, fontWeight: '800', marginTop: 6 }, screenSub: { color: '#737A72', fontSize: 8, fontWeight: '600', marginTop: 3 }, tapGlyph: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#4A5048', alignItems: 'center', justifyContent: 'center' }, tapGlyphText: { color: '#D1D6CD', fontSize: 10, fontWeight: '900', transform: [{ rotate: '-90deg' }] },
  spinner: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#333A34', borderTopColor: '#B9F55D' }, spinnerTip: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#B9F55D', marginLeft: 20 }, approvedRing: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#82B54A', backgroundColor: '#162310', alignItems: 'center', justifyContent: 'center' }, approvedCheck: { color: '#A8DE6C', fontSize: 19, fontWeight: '800' }, approvedTitle: { color: '#A8DE6C', fontSize: 12, fontWeight: '800', marginTop: 6 },
  deviceMeta: { position: 'absolute', left: 22, right: 22, bottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, deviceBrand: { color: '#555B53', fontSize: 7, fontWeight: '900', letterSpacing: 2 }, light: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#454A43' }, lightOn: { backgroundColor: '#9EDC5C', shadowColor: '#9EDC5C', shadowOpacity: 1, shadowRadius: 7 },
  slotFrame: { position: 'absolute', left: 23, right: 23, bottom: 11, height: 16, borderRadius: 8, backgroundColor: '#30342F', borderWidth: 1, borderColor: '#454A43', overflow: 'hidden', justifyContent: 'center' }, slotInner: { position: 'absolute', left: 7, right: 7, height: 7, borderRadius: 4, backgroundColor: '#030403' }, feedProgress: { position: 'absolute', left: 10, bottom: 2, height: 1, backgroundColor: '#91CF53' }, footLeft: { position: 'absolute', left: 38, bottom: -6, width: 42, height: 9, borderRadius: 5, backgroundColor: '#151714' }, footRight: { position: 'absolute', right: 38, bottom: -6, width: 42, height: 9, borderRadius: 5, backgroundColor: '#151714' },
  paperViewport: { position: 'absolute', zIndex: 2, top: 197, width: 292, height: 303, alignItems: 'center', overflow: 'hidden' }, paper: { width: 252, height: PAPER_HEIGHT, shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowRadius: 20, elevation: 14 }, tearLine: { position: 'absolute', left: 13, right: 13, top: 5, borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#9E998F', alignItems: 'center' }, tearGrip: { width: 34, height: 3, borderRadius: 2, backgroundColor: '#AAA59B', marginTop: -2 }, slotMask: { position: 'absolute', zIndex: 3, top: 0, left: 0, right: 0, height: 202, backgroundColor: palette.ink },
});
