import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [certPw, setCertPw] = useState('');
  const [idFocused, setIdFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [certFocused, setCertFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    navigation.navigate('Account');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>

          {/* 로고 */}
          <View style={styles.logoArea}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>LS</Text>
            </View>
            <Text style={styles.logoTitle}>LS증권</Text>
            <Text style={styles.logoSub}>모바일 트레이딩</Text>
          </View>

          {/* 폼 */}
          <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>

            {/* 아이디 */}
            <FloatingInput
              label="아이디"
              value={id}
              onChangeText={(v) => { setId(v); setError(''); }}
              focused={idFocused}
              onFocus={() => setIdFocused(true)}
              onBlur={() => setIdFocused(false)}
              autoCapitalize="none"
              returnKeyType="next"
            />

            {/* 비밀번호 */}
            <FloatingInput
              label="비밀번호"
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); }}
              focused={pwFocused}
              onFocus={() => setPwFocused(true)}
              onBlur={() => setPwFocused(false)}
              secureTextEntry
              returnKeyType="next"
            />

            {/* 공동인증서 구분선 */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>공동인증서</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 공동인증서 비밀번호 - FloatingInput과 동일한 구조, 아이콘만 추가 */}
            <View style={[styles.inputWrap, certFocused && styles.inputWrapFocused]}>
              {/* absolute label: 아이콘 너비(28)만큼 left 조정 */}
              <Text style={[
                styles.inputLabel,
                { left: 44 },
                (certFocused || certPw) && styles.inputLabelActive,
              ]}>
                인증서 비밀번호
              </Text>
              <Text style={styles.certIcon}>🔐</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={certPw}
                onChangeText={(v) => { setCertPw(v); setError(''); }}
                onFocus={() => setCertFocused(true)}
                onBlur={() => setCertFocused(false)}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                placeholderTextColor="transparent"
                placeholder=" "
              />
            </View>
            <Text style={styles.certHint}>공동인증서(구 공인인증서) 비밀번호를 입력하세요</Text>

            {/* 에러 */}
            {error ? <Text style={styles.errorText}>⚠ {error}</Text> : null}

            {/* 로그인 버튼 */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonLoading]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>로그인</Text>
              }
            </TouchableOpacity>

            {/* 부가 링크 */}
            <View style={styles.links}>
              <TouchableOpacity><Text style={styles.linkText}>아이디 찾기</Text></TouchableOpacity>
              <Text style={styles.linkDivider}>|</Text>
              <TouchableOpacity><Text style={styles.linkText}>비밀번호 찾기</Text></TouchableOpacity>
              <Text style={styles.linkDivider}>|</Text>
              <TouchableOpacity><Text style={styles.linkText}>회원가입</Text></TouchableOpacity>
            </View>
          </Animated.View>

          <Text style={styles.footer}>LS Securities Co., Ltd.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Floating Label 입력 서브 컴포넌트 ──
interface FloatingInputProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences';
  returnKeyType?: 'next' | 'done';
}

function FloatingInput({
  label, value, onChangeText, focused, onFocus, onBlur,
  secureTextEntry, autoCapitalize, returnKeyType,
}: FloatingInputProps) {
  return (
    <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
      <Text style={[styles.inputLabel, (focused || value) && styles.inputLabelActive]}>
        {label}
      </Text>
      <TextInput
        style={[styles.input, { flex: 1 }]}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        returnKeyType={returnKeyType}
        placeholderTextColor="transparent"
        placeholder=" "
      />
    </View>
  );
}

// ── 스타일 ──
const BLUE = '#1A4FD6';
const DARK = '#0A0E1A';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },

  // 로고
  logoArea: { alignItems: 'center', marginBottom: 40 },
  logoMark: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: BLUE,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    shadowColor: BLUE, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  logoMarkText: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  logoTitle: { fontSize: 22, fontWeight: '700', color: DARK, letterSpacing: -0.5 },
  logoSub: { fontSize: 13, color: '#94A3B8', marginTop: 4, fontWeight: '500' },

  form: { marginTop: 0 },

  // 입력 공통
  inputWrap: {
    borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, backgroundColor: '#fff',
    height: 58,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16, paddingBottom: 10,
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  inputWrapFocused: {
    borderColor: BLUE,
    shadowColor: BLUE, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3,
  },
  inputLabel: {
    position: 'absolute', left: 16, top: 18,
    fontSize: 15, color: '#94A3B8', fontWeight: '500',
  },
  inputLabelActive: { top: 9, fontSize: 11, color: BLUE, fontWeight: '600' },
  input: { fontSize: 15, color: DARK, fontWeight: '500', padding: 0, height: 24 },

  // 인증서 전용
  certIcon: { fontSize: 18, marginRight: 8, marginBottom: 2 },

  // 구분선
  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', letterSpacing: 0.5, marginHorizontal: 10 },

  certHint: { fontSize: 11, color: '#B0BAC9', marginTop: -8, marginBottom: 12, marginLeft: 4 },
  errorText: { color: '#EF4444', fontSize: 12, fontWeight: '500', marginLeft: 4, marginBottom: 8 },

  // 버튼
  button: {
    backgroundColor: BLUE, height: 54,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
    shadowColor: BLUE, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  buttonLoading: { opacity: 0.8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  links: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  linkText: { fontSize: 13, color: '#64748B', fontWeight: '500', marginHorizontal: 8 },
  linkDivider: { color: '#CBD5E1', fontSize: 12 },

  footer: { textAlign: 'center', color: '#CBD5E1', fontSize: 11, marginTop: 40, letterSpacing: 0.5 },
});
