import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, ReduceMotion, ZoomIn } from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ReceiptPrinter } from './src/components/ReceiptPrinter';
import { palette } from './src/theme';
import type { PaymentStage } from './src/types';

function Success({ reduceMotion, onDone }: { reduceMotion: boolean; onDone: () => void }) {
  return <Animated.View entering={FadeIn.duration(reduceMotion ? 0 : 300)} style={styles.successScreen}>
    <Animated.View entering={ZoomIn.delay(reduceMotion ? 0 : 100).duration(reduceMotion ? 0 : 380).reduceMotion(ReduceMotion.System)} style={styles.successRing}>
      <View style={styles.successRingInner}><Text style={styles.successCheck}>✓</Text></View>
    </Animated.View>
    <Text style={styles.successTitle} accessibilityRole="header">Payment successful</Text>
    <Text style={styles.successBody}>Your receipt has been saved and sent to your email.</Text>
    <View style={styles.savedCard}>
      <View style={styles.savedIcon}><Text style={styles.savedIconText}>▤</Text></View>
      <View><Text style={styles.savedTitle}>Receipt · #00184</Text><Text style={styles.savedMeta}>₦24,500  ·  Today, 14:38</Text></View>
      <Text style={styles.savedCheck}>✓</Text>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Done, restart demo" onPress={onDone} style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}><Text style={styles.doneText}>DONE</Text></Pressable>
  </Animated.View>;
}

function Experiment() {
  const [stage, setStage] = useState<PaymentStage>('checkout');
  const [reduceMotion, setReduceMotion] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { sub.remove(); if (timer.current) clearTimeout(timer.current); };
  }, []);
  const pay = () => {
    if (stage !== 'checkout') return;
    setStage('processing');
    timer.current = setTimeout(() => setStage('approved'), reduceMotion ? 180 : 1250);
  };
  const onPrinted = useCallback(() => setStage(current => current === 'approved' ? 'ready' : current), []);
  const onDetached = useCallback(() => setStage('detached'), []);
  const reset = () => setStage('checkout');

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    {stage === 'detached' ? <Success reduceMotion={reduceMotion} onDone={reset} /> : <Animated.View exiting={FadeOut.duration(180)} style={styles.shell}>
      <View style={styles.nav}><Text style={styles.back}>‹</Text><Text style={styles.navTitle}>Checkout</Text><Text style={styles.more}>•••</Text></View>
      <View style={styles.amountBlock} accessibilityLabel="Total amount, 24,500 naira"><Text style={styles.amount}>₦24,500<Text style={styles.cents}>.00</Text></Text><Text style={styles.amountLabel}>TOTAL AMOUNT</Text></View>
      <View style={styles.printerWrap}><ReceiptPrinter stage={stage} reduceMotion={reduceMotion} onPrinted={onPrinted} onDetached={onDetached} /></View>
      <View style={styles.footer}>
        {stage === 'checkout' && <Pressable accessibilityRole="button" accessibilityLabel="Pay 24,500 naira" onPress={pay} style={({ pressed }) => [styles.payButton, pressed && styles.pressed]}><Text style={styles.payText}>PAY ₦24,500</Text><View style={styles.payArrow}><Text style={styles.payArrowText}>→</Text></View></Pressable>}
        {stage === 'processing' && <View style={styles.disabledButton}><View style={styles.buttonSpinner} /><Text style={styles.disabledText}>PROCESSING PAYMENT</Text></View>}
        {stage === 'approved' && <Text style={styles.statusText}>PRINTING YOUR RECEIPT</Text>}
        {stage === 'ready' && <View style={styles.takePrompt}><View style={styles.promptLine} /><Text style={styles.statusText}>PULL DOWN TO TEAR</Text><View style={styles.promptLine} /></View>}
      </View>
    </Animated.View>}
  </SafeAreaView>;
}

export default function App() { return <GestureHandlerRootView style={styles.root}><SafeAreaProvider><StatusBar style="light" /><Experiment /></SafeAreaProvider></GestureHandlerRootView>; }

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink }, safe: { flex: 1, backgroundColor: palette.ink }, shell: { flex: 1, paddingHorizontal: 22 }, nav: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { color: '#9A9F98', fontSize: 28, fontWeight: '300', width: 34 }, navTitle: { color: '#F2F1EC', fontSize: 13, fontWeight: '800', letterSpacing: 0.2 }, more: { color: '#7A8079', fontSize: 12, letterSpacing: 2, width: 34, textAlign: 'right' },
  amountBlock: { alignItems: 'center', paddingTop: 17, paddingBottom: 22 }, amount: { color: '#F4F3EE', fontSize: 32, fontWeight: '800', letterSpacing: -0.9 }, cents: { color: '#92988F', fontSize: 20, fontWeight: '700' }, amountLabel: { color: '#6E746D', fontSize: 8, fontWeight: '800', letterSpacing: 1.8, marginTop: 7 }, printerWrap: { flex: 1, alignItems: 'center', minHeight: 500 },
  footer: { height: 78, justifyContent: 'center', paddingBottom: 6 }, payButton: { height: 58, borderRadius: 18, backgroundColor: '#F1F0EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 22, paddingRight: 11, shadowColor: '#FFF', shadowOpacity: 0.08, shadowRadius: 18 }, pressed: { transform: [{ scale: 0.985 }], opacity: 0.88 }, payText: { color: '#111310', fontSize: 12, fontWeight: '900', letterSpacing: 1 }, payArrow: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#171916', alignItems: 'center', justifyContent: 'center' }, payArrowText: { color: '#F1F0EB', fontSize: 19, fontWeight: '600' },
  disabledButton: { height: 58, borderRadius: 18, backgroundColor: '#171A17', borderWidth: 1, borderColor: '#252925', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }, buttonSpinner: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: '#454B44', borderTopColor: '#B9F55D' }, disabledText: { color: '#686E67', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 }, statusText: { color: '#7D837B', fontSize: 9, fontWeight: '900', letterSpacing: 1.8, textAlign: 'center' }, takePrompt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }, promptLine: { width: 24, height: 1, backgroundColor: '#333733' },
  successScreen: { flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' }, successRing: { width: 94, height: 94, borderRadius: 47, borderWidth: 1, borderColor: '#35452A', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }, successRingInner: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#89B959', backgroundColor: '#11190D', alignItems: 'center', justifyContent: 'center', shadowColor: '#8EC45A', shadowOpacity: 0.25, shadowRadius: 22 }, successCheck: { color: '#A6DB70', fontSize: 34, fontWeight: '600' }, successTitle: { color: '#A7DC71', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 }, successBody: { color: '#858B83', fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 270, marginTop: 9 },
  savedCard: { width: '100%', height: 72, borderRadius: 18, backgroundColor: '#141714', borderWidth: 1, borderColor: '#292D29', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginTop: 38 }, savedIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#20251E', alignItems: 'center', justifyContent: 'center', marginRight: 12 }, savedIconText: { color: '#9ED46A', fontSize: 18 }, savedTitle: { color: '#E5E5E0', fontSize: 11, fontWeight: '800' }, savedMeta: { color: '#717770', fontSize: 8, fontWeight: '600', marginTop: 5 }, savedCheck: { marginLeft: 'auto', color: '#94C762', fontSize: 15, fontWeight: '900' },
  doneButton: { position: 'absolute', left: 24, right: 24, bottom: 28, height: 58, borderRadius: 18, backgroundColor: '#20241F', borderWidth: 1, borderColor: '#303530', alignItems: 'center', justifyContent: 'center' }, doneText: { color: '#ECEDE8', fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
});
