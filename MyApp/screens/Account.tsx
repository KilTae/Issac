import React from 'react';
const { useEffect, useState } = React;
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getAccessToken, getAccountTrades, getHighStockItems, getAccountBalance } from '../api/lsApi';

const BLUE = '#1A4FD6';
const DARK = '#0A0E1A';

const fmt = (n: any) => Number(n ?? 0).toLocaleString('ko-KR');

export default function AccountScreen() {
  const [trades, setTrades]         = useState<any[]>([]);
  const [stocks, setStocks]         = useState<any[]>([]);
  const [balance, setBalance]       = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async (isRefresh: boolean) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      await getAccessToken();

      // Promise.all 대신 순차 호출
      const balData   = await getAccountBalance();
      const tradeData = await getAccountTrades('20260301', '20260303');
      const stockData = await getHighStockItems();

      setBalance(balData   ? balData.t0424OutBlock         : null);
      setTrades(tradeData  ? (tradeData.CDPCQ04700OutBlock3 || []) : []);
      setStocks(stockData  ? (stockData.t1441OutBlock1      || []) : []);

    } catch (err) {
      console.error('데이터 조회 실패:', err);
    }

    if (isRefresh) {
      setRefreshing(false);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(false);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.loadingText}>데이터 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAll(true)}
            tintColor={BLUE}
            colors={[BLUE]}
          />
        }
      >
        {/* 계좌 요약 */}
        {balance !== null && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>내 계좌</Text>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryItem, { marginRight: 6 }]}>
                <Text style={styles.summaryLabel}>추정순자산</Text>
                <Text style={styles.summaryValue}>{fmt(balance.sunamt)}원</Text>
              </View>
              <View style={[styles.summaryItem, { marginLeft: 6 }]}>
                <Text style={styles.summaryLabel}>매입금액</Text>
                <Text style={styles.summaryValue}>{fmt(balance.mamt)}원</Text>
              </View>
            </View>
            <View style={[styles.summaryRow, { marginTop: 10 }]}>
              <View style={[styles.summaryItem, { marginRight: 6 }]}>
                <Text style={styles.summaryLabel}>당일손익</Text>
                <Text style={[
                  styles.summaryValue,
                  { color: Number(balance.dtsunik) >= 0 ? '#16A34A' : '#DC2626' },
                ]}>
                  {Number(balance.dtsunik) >= 0 ? '+' : ''}{fmt(balance.dtsunik)}원
                </Text>
              </View>
              <View style={[styles.summaryItem, { marginLeft: 6 }]}>
                <Text style={styles.summaryLabel}>평가손익</Text>
                <Text style={[
                  styles.summaryValue,
                  { color: Number(balance.tdtsunik) >= 0 ? '#16A34A' : '#DC2626' },
                ]}>
                  {Number(balance.tdtsunik) >= 0 ? '+' : ''}{fmt(balance.tdtsunik)}원
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 계좌 거래내역 */}
        <View style={[styles.card, { marginTop: 14 }]}>
          <Text style={styles.cardTitle}>계좌 거래내역</Text>
          {trades.length === 0 ? (
            <Text style={styles.emptyText}>거래내역이 없습니다</Text>
          ) : (
            trades.map((item: any, index: number) => (
              <View
                key={String(item.TrdNo) + String(index)}
                style={index === trades.length - 1 ? styles.listRowLast : styles.listRow}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.listName}>{item.IsuNm}</Text>
                  <Text style={styles.listSub}>{item.TrdDt}</Text>
                </View>
                <Text style={styles.listAmount}>{fmt(item.TrdAmt)}원</Text>
              </View>
            ))
          )}
        </View>

        {/* 등락률 상위 종목 */}
        <View style={[styles.card, { marginTop: 14 }]}>
          <Text style={styles.cardTitle}>등락률 상위 종목</Text>
          {stocks.length === 0 ? (
            <Text style={styles.emptyText}>데이터가 없습니다</Text>
          ) : (
            stocks.map((item: any, index: number) => {
              const rate = Number(item.diff || 0);
              const isUp = rate >= 0;
              return (
                <View
                  key={String(item.shcode) + String(index)}
                  style={index === stocks.length - 1 ? styles.listRowLast : styles.listRow}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listName}>{item.hname}</Text>
                    <Text style={styles.listSub}>{item.shcode}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.listAmount}>{fmt(item.price)}원</Text>
                    <Text style={[styles.listRate, { color: isUp ? '#DC2626' : '#2563EB' }]}>
                      {isUp ? '▲' : '▼'} {Math.abs(rate).toFixed(2)}%
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <Text style={[styles.footer, { marginTop: 14 }]}>당겨서 새로고침</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#F7F9FC' },
  scroll:      { padding: 16 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, color: '#94A3B8', fontWeight: '500', marginTop: 14 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 18,
    paddingVertical: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DARK,
    marginBottom: 14,
  },

  summaryRow:  { flexDirection: 'row' },
  summaryItem: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '700', color: DARK },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  listRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listName:   { fontSize: 14, fontWeight: '600', color: DARK, marginBottom: 3 },
  listSub:    { fontSize: 11, color: '#94A3B8' },
  listAmount: { fontSize: 14, fontWeight: '700', color: DARK },
  listRate:   { fontSize: 12, fontWeight: '600', marginTop: 2 },

  emptyText: { fontSize: 13, color: '#CBD5E1', textAlign: 'center', paddingVertical: 16 },
  footer:    { textAlign: 'center', color: '#CBD5E1', fontSize: 11 },
});
