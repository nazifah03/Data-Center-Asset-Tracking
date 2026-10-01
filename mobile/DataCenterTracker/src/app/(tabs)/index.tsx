import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { assetApi } from '@/api/asset.api';
import { aiApi } from '@/api/ai.api';
import { getErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius, Shadows } from '@/theme/spacing';
import { FontSizes, FontWeights } from '@/theme/typography';
import type { AssetStatistics, RiskSummary } from '@/types';

export default function DashboardScreen() {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [stats, setStats] = useState<AssetStatistics | null>(null);
  const [risk, setRisk] = useState<RiskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      console.log('📊 Loading dashboard data...');
      const [statsData, riskData] = await Promise.all([
        assetApi.getStatistics(),
        aiApi.getRiskSummary(),
      ]);
      console.log('✅ Stats:', statsData);
      console.log('✅ Risk:', riskData);
      setStats(statsData);
      setRisk(riskData);
    } catch (error) {
      console.error('❌ Dashboard error:', error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    })();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Yakin ingin logout?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Memuat dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              Selamat datang,
            </Text>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.fullName || user?.username || 'User'}
            </Text>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: theme.primary + '20' },
              ]}
            >
              <Text style={[styles.roleText, { color: theme.primary }]}>
                {user?.role}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.logoutBtn, { backgroundColor: theme.backgroundElement }]}
          >
            <Ionicons name="log-out-outline" size={22} color={theme.danger} />
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          📊 Statistik Aset
        </Text>

        <View style={styles.statsGrid}>
          <StatCard icon="server-outline" label="Total" value={stats?.total ?? 0} color={theme.primary} theme={theme} />
          <StatCard icon="checkmark-circle-outline" label="Active" value={stats?.active ?? 0} color={theme.statusActive} theme={theme} />
          <StatCard icon="construct-outline" label="Maintenance" value={stats?.maintenance ?? 0} color={theme.statusMaintenance} theme={theme} />
          <StatCard icon="close-circle-outline" label="Inactive" value={stats?.inactive ?? 0} color={theme.statusInactive} theme={theme} />
        </View>

        {/* AI Alert */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          🤖 AI Risk Analysis
        </Text>

        <View
          style={[
            styles.alertCard,
            {
              backgroundColor: (risk?.byLevel.high ?? 0) > 0 ? theme.riskHigh + '15' : theme.backgroundElement,
              borderColor: (risk?.byLevel.high ?? 0) > 0 ? theme.riskHigh : theme.border,
            },
          ]}
        >
          <View style={styles.alertHeader}>
            <Ionicons
              name={(risk?.byLevel.high ?? 0) > 0 ? 'warning' : 'shield-checkmark'}
              size={28}
              color={(risk?.byLevel.high ?? 0) > 0 ? theme.riskHigh : theme.success}
            />
            <View style={styles.alertTextContainer}>
              <Text style={[styles.alertTitle, { color: theme.text }]}>
                {(risk?.byLevel.high ?? 0) > 0
                  ? `${risk?.byLevel.high} Aset Berisiko Tinggi`
                  : 'Semua Aset Aman'}
              </Text>
              <Text style={[styles.alertSubtitle, { color: theme.textSecondary }]}>
                {(risk?.byLevel.high ?? 0) > 0
                  ? 'Perlu tindakan segera'
                  : 'Tidak ada risiko tinggi terdeteksi'}
              </Text>
            </View>
          </View>

          <View style={styles.riskRow}>
            <RiskBadge label="High" count={risk?.byLevel.high ?? 0} color={theme.riskHigh} theme={theme} />
            <RiskBadge label="Medium" count={risk?.byLevel.medium ?? 0} color={theme.riskMedium} theme={theme} />
            <RiskBadge label="Low" count={risk?.byLevel.low ?? 0} color={theme.riskLow} theme={theme} />
          </View>
        </View>

        <Text style={[styles.footer, { color: theme.textSecondary }]}>
          Tarik ke bawah untuk refresh
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ icon, label, value, color, theme }: any) => (
  <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }, Shadows.card]}>
    <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
  </View>
);

const RiskBadge = ({ label, count, color, theme }: any) => (
  <View style={styles.riskBadge}>
    <View style={[styles.riskDot, { backgroundColor: color }]} />
    <View>
      <Text style={[styles.riskLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.riskCount, { color: theme.text }]}>{count}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: Spacing.md, fontSize: FontSizes.base },
  scrollContent: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  headerLeft: { flex: 1 },
  greeting: { fontSize: FontSizes.base, marginBottom: 2 },
  userName: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, marginBottom: Spacing.xs },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  roleText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  logoutBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, marginBottom: Spacing.md, marginTop: Spacing.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.lg },
  statCard: { flex: 1, minWidth: '45%', padding: Spacing.base, borderRadius: BorderRadius.lg, alignItems: 'center' },
  statIconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  statValue: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold, marginBottom: 2 },
  statLabel: { fontSize: FontSizes.sm },
  alertCard: { padding: Spacing.base, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.lg },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  alertTextContainer: { marginLeft: Spacing.md, flex: 1 },
  alertTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, marginBottom: 2 },
  alertSubtitle: { fontSize: FontSizes.sm },
  riskRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  riskBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  riskDot: { width: 10, height: 10, borderRadius: 5 },
  riskLabel: { fontSize: FontSizes.xs },
  riskCount: { fontSize: FontSizes.md, fontWeight: FontWeights.bold },
  footer: { textAlign: 'center', fontSize: FontSizes.sm, marginTop: Spacing.lg },
});
