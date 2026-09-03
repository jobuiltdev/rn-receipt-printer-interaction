import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { palette } from '../theme';

function Barcode() {
  const bars = [2,1,3,1,2,4,1,2,1,3,2,1,4,2,1,3,1,2,4,1,1,3,2,1,4,2,1,3,2,1,2,4];
  let x = 0;
  return <Svg width="100%" height="34" viewBox="0 0 180 34">
    {bars.map((width, index) => { const node = <Rect key={index} x={x} y={index % 5 === 0 ? 0 : 3} width={width} height={index % 5 === 0 ? 29 : 25} fill="#171714" />; x += width + (index % 3 === 0 ? 3 : 2); return node; })}
  </Svg>;
}

export function Receipt({ detached = false }: { detached?: boolean }) {
  return <View style={[styles.paper, detached && styles.detached]}>
    <View style={styles.paperTint} />
    <View style={styles.brandRow}>
      <View style={styles.monogram}><Text style={styles.monogramText}>F</Text></View>
      <View><Text style={styles.brand}>FIELD SUPPLY</Text><Text style={styles.location}>14 GLOVER ROAD · IKOYI, LAGOS</Text></View>
    </View>
    <Text style={styles.receiptTitle}>PAYMENT RECEIPT</Text>
    <View style={styles.dashed} />
    <View style={styles.itemRow}><View><Text style={styles.item}>Ceramic pour-over</Text><Text style={styles.itemMeta}>STONE / ONE SIZE</Text></View><Text style={styles.price}>₦18,500</Text></View>
    <View style={styles.itemRow}><View><Text style={styles.item}>House roast</Text><Text style={styles.itemMeta}>250G / WHOLE BEAN</Text></View><Text style={styles.price}>₦6,000</Text></View>
    <View style={styles.dashed} />
    <View style={styles.totalRow}><Text style={styles.totalLabel}>TOTAL</Text><Text style={styles.total}>₦24,500</Text></View>
    <View style={styles.metaGrid}>
      <View><Text style={styles.metaLabel}>DATE</Text><Text style={styles.metaValue}>02 SEP 2026</Text></View>
      <View><Text style={styles.metaLabel}>TIME</Text><Text style={styles.metaValue}>14:38</Text></View>
      <View><Text style={styles.metaLabel}>PAYMENT</Text><Text style={styles.metaValue}>VISA ···· 4242</Text></View>
      <View><Text style={styles.metaLabel}>AUTH</Text><Text style={styles.metaValue}>7K3P2A</Text></View>
    </View>
    <View style={styles.approvalRow}><View style={styles.approvalDot}><Text style={styles.check}>✓</Text></View><View><Text style={styles.approved}>PAYMENT APPROVED</Text><Text style={styles.approvedMeta}>NO SIGNATURE REQUIRED</Text></View></View>
    <View style={styles.barcode}><Barcode /><Text style={styles.code}>00184  24500  020926  7K3P2A</Text></View>
    <Text style={styles.thanks}>THANK YOU FOR STOPPING BY</Text>
    <Text style={styles.url}>FIELDSUPPLY.CO</Text>
    <Svg width="100%" height="11" viewBox="0 0 300 11" style={styles.zigzag}><Path d="M0 0 L6 9 L12 0 L18 9 L24 0 L30 9 L36 0 L42 9 L48 0 L54 9 L60 0 L66 9 L72 0 L78 9 L84 0 L90 9 L96 0 L102 9 L108 0 L114 9 L120 0 L126 9 L132 0 L138 9 L144 0 L150 9 L156 0 L162 9 L168 0 L174 9 L180 0 L186 9 L192 0 L198 9 L204 0 L210 9 L216 0 L222 9 L228 0 L234 9 L240 0 L246 9 L252 0 L258 9 L264 0 L270 9 L276 0 L282 9 L288 0 L294 9 L300 0" fill={palette.ink} fillOpacity={0.12} /></Svg>
  </View>;
}

const styles = StyleSheet.create({
  paper: { width: 252, height: 390, backgroundColor: '#F2EFE6', paddingHorizontal: 20, paddingTop: 22, overflow: 'hidden' }, detached: { shadowColor: '#000', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.44, shadowRadius: 26, elevation: 18 },
  paperTint: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#FFFCF3', opacity: 0.34 }, brandRow: { flexDirection: 'row', alignItems: 'center' }, monogram: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#171714', alignItems: 'center', justifyContent: 'center', marginRight: 9 }, monogramText: { color: '#F2EFE6', fontSize: 15, fontWeight: '900' },
  brand: { color: '#171714', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }, location: { color: '#77736A', fontSize: 6, fontWeight: '700', letterSpacing: 0.7, marginTop: 3 }, receiptTitle: { color: '#171714', fontSize: 9, fontWeight: '900', letterSpacing: 2, textAlign: 'center', marginTop: 19 },
  dashed: { height: 1, backgroundColor: '#C5C0B5', marginVertical: 13 }, itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, item: { color: '#24231F', fontSize: 9, fontWeight: '700' }, itemMeta: { color: '#8A857B', fontSize: 6, fontWeight: '700', letterSpacing: 0.6, marginTop: 3 }, price: { color: '#24231F', fontSize: 9, fontWeight: '800' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, totalLabel: { color: '#24231F', fontSize: 9, fontWeight: '900', letterSpacing: 1.4 }, total: { color: '#171714', fontSize: 18, fontWeight: '900', letterSpacing: -0.4 }, metaGrid: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 }, metaLabel: { color: '#989288', fontSize: 6, fontWeight: '800', letterSpacing: 0.8 }, metaValue: { color: '#37352F', fontSize: 7, fontWeight: '800', marginTop: 3 },
  approvalRow: { marginTop: 14, borderRadius: 8, backgroundColor: '#E1E8D7', padding: 8, flexDirection: 'row', alignItems: 'center' }, approvalDot: { width: 19, height: 19, borderRadius: 10, backgroundColor: '#587A34', alignItems: 'center', justifyContent: 'center', marginRight: 8 }, check: { color: '#fff', fontSize: 11, fontWeight: '900' }, approved: { color: '#405E22', fontSize: 7, fontWeight: '900', letterSpacing: 0.8 }, approvedMeta: { color: '#708458', fontSize: 5, fontWeight: '700', letterSpacing: 0.5, marginTop: 2 },
  barcode: { marginTop: 13, alignItems: 'center' }, code: { color: '#656158', fontSize: 5, fontWeight: '700', letterSpacing: 0.6, marginTop: 2 }, thanks: { color: '#24231F', fontSize: 7, fontWeight: '900', letterSpacing: 1.1, textAlign: 'center', marginTop: 10 }, url: { color: '#8A857B', fontSize: 6, fontWeight: '800', letterSpacing: 1, textAlign: 'center', marginTop: 3 }, zigzag: { position: 'absolute', left: 0, bottom: 0 },
});
