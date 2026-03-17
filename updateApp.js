const fs = require('fs');

const content = \import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, TextInput, 
  ActivityIndicator, Platform, Animated, Dimensions, PanResponder,
  SafeAreaView
} from 'react-native';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import ProfileScreen from './ProfileScreen';
import MapScreen from './MapScreen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

const API_URL = Platform.select({
  web: 'http://localhost:5000',
  android: 'http://10.0.2.2:5000',
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000'
});

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(\\\\/auth/login\\\, { email, password });
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    setLoading(true);
    try {
      const response = await axios.post(\\\\/auth/register\\\, { email, password, name });
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
        {children}
    </AuthContext.Provider>
  );
};

const GradientBackground = ({ children, color = '#fd297b' }) => (
  <View style={[styles.gradientBg, { backgroundColor: color }]}>
    {children}
  </View>
);

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, register, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    const result = isLogin ? await login(email, password) : await register(email, password, name);
    if (!result.success) setError(result.error);
  };

  return (
    <GradientBackground color='#fd297b'>
      <Animated.View style={[styles.authContainer, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🔥</Text>
          <Text style={styles.logoText}>ShelterMatch</Text>
        </View>

        <View style={styles.authCard}>
          <Text style={styles.authTitle}>{isLogin ? 'Get Started' : 'Join Us'}</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.authButton} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.authButtonText}>{isLogin ? 'LOG IN' : 'CONTINUE'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(''); }}>
            <Text style={styles.switchText}>
              {isLogin ? "Trouble logging in? Sign Up" : 'Already have an account? Log In'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demoSection}>
          <TouchableOpacity 
            style={styles.demoButton}
            onPress={() => { setEmail('demo@test.com'); setPassword('demo123'); }}
          >
            <Text style={styles.demoButtonText}>USE DEMO ACCOUNT</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GradientBackground>
  );
};

const SwipeCard = ({ shelter, onSwipeLeft, onSwipeRight, isFirst }) => {
  const position = useRef(new Animated.ValueXY()).current;
  const rotateCard = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isFirst,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.spring(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
            useNativeDriver: true,
          }).start(() => onSwipeRight());
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.spring(position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gesture.dy },
            useNativeDriver: true,
          }).start(() => onSwipeLeft());
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const cardStyle = isFirst
    ? {
        transform: [
          { translateX: position.x },
          { translateY: position.y },
          { rotate: rotateCard },
        ],
      }
    : { transform: [{ scale: 0.95 }], top: -5 };

  return (
    <Animated.View
      style={[styles.card, cardStyle]}
      {...(isFirst ? panResponder.panHandlers : {})}
    >
      <Image source={{ uri: shelter.image }} style={styles.cardImage} />

      <View style={styles.imageOverlay} />
      
      <Animated.View style={[styles.stampContainer, styles.likeStamp, { opacity: likeOpacity }]}>
        <Text style={styles.stampText}>LIKE</Text>
      </Animated.View>
      
      <Animated.View style={[styles.stampContainer, styles.nopeStamp, { opacity: nopeOpacity }]}>
        <Text style={[styles.stampText, styles.nopeText]}>NOPE</Text>
      </Animated.View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{shelter.name} <Text style={styles.cardAge}>{shelter.availableBeds || '12'}</Text></Text>
        <Text style={styles.cardLocation}>📍 {shelter.location}</Text>
        <Text style={styles.cardDetail}>{shelter.gender || 'Mixed'} • {shelter.distance || '2 kilometers away'}</Text>
        {shelter.amenities && (
          <View style={styles.amenityTags}>
            {shelter.amenities.slice(0, 3).map((amenity, i) => (
              <View key={i} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const SwipeScreen = () => {
  const [shelters, setShelters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const rewindAnim = useRef(new Animated.Value(1)).current;
  const skipAnim = useRef(new Animated.Value(1)).current;
  const starAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;
  const boostAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(\\\\/shelters\\\);
      setShelters(response.data);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const animateButton = (anim) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleSwipeRight = async () => {
    if (!user?.id || !shelters[currentIndex]) return;
    try { await axios.post(\\\\/swipe-right\\\, { userId: user.id, shelterId: shelters[currentIndex].id }); } catch (err) {}
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipeLeft = async () => {
    if (!user?.id || !shelters[currentIndex]) return;
    try { await axios.post(\\\\/swipe-left\\\, { userId: user.id, shelterId: shelters[currentIndex].id }); } catch (err) {}
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <View style={[styles.swipeContainer, styles.centerContent]}>
        <ActivityIndicator size="large" color="#fd297b" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.swipeContainer, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <View style={styles.header}>
        <Text style={styles.headerLogo}>🔥 ShelterMatch</Text>
      </View>

      <View style={styles.cardsContainer}>
        {currentIndex >= shelters.length ? (
            <View style={styles.centerContent}>
              <Text style={{fontSize: 24, color: '#999', marginBottom: 20}}>No more shelters</Text>
              <TouchableOpacity style={styles.resetBtn} onPress={() => setCurrentIndex(0)}>
                <Text style={styles.resetText}>Recalculate area</Text>
              </TouchableOpacity>
            </View>
        ) : (
          shelters.slice(currentIndex, currentIndex + 2).reverse().map((shelter, i, arr) => (
            <SwipeCard
              key={shelter.id}
              shelter={shelter}
              isFirst={i === arr.length - 1}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          ))
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <Animated.View style={{ transform: [{ scale: rewindAnim }] }}>
          <TouchableOpacity style={[styles.actionButton, styles.smallButton, { borderColor: '#f5b748' }]} onPress={() => animateButton(rewindAnim)}>
            <Text style={{ color: '#f5b748', fontSize: 24, fontWeight: 'bold' }}>↺</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: skipAnim }] }}>
          <TouchableOpacity style={[styles.actionButton, styles.largeButton, { borderColor: '#fd297b' }]} onPress={() => { animateButton(skipAnim); handleSwipeLeft(); }}>
            <Text style={{ color: '#fd297b', fontSize: 36, fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={{ transform: [{ scale: starAnim }] }}>
          <TouchableOpacity style={[styles.actionButton, styles.smallButton, { borderColor: '#21bdfc' }]} onPress={() => animateButton(starAnim)}>
            <Text style={{ color: '#21bdfc', fontSize: 24 }}>⭐</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
          <TouchableOpacity style={[styles.actionButton, styles.largeButton, { borderColor: '#37e096' }]} onPress={() => { animateButton(heartAnim); handleSwipeRight(); }}>
            <Text style={{ color: '#37e096', fontSize: 36 }}>♥</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: boostAnim }] }}>
          <TouchableOpacity style={[styles.actionButton, styles.smallButton, { borderColor: '#a65cf0' }]} onPress={() => animateButton(boostAnim)}>
            <Text style={{ color: '#a65cf0', fontSize: 24 }}>⚡</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const Tab = createBottomTabNavigator();

const MainApp = () => {
  const { user } = useAuth();
  if (!user) return <AuthScreen />;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#fd297b',
        tabBarInactiveTintColor: '#cacad0',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Discover" 
        component={SwipeScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color: color }}>🔥</Text> }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color: color }}>🗺️</Text> }}
      />
      <Tab.Screen 
        name="Saved" 
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color: color }}>💬</Text> }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <MainApp />
      </NavigationContainer>
    </AuthProvider>
  );
}

export { API_URL };

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  authContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoIcon: { fontSize: 70, marginBottom: 10 },
  logoText: { fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  authCard: { width: '100%', maxWidth: 380, padding: 10 },
  authTitle: { fontSize: 24, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 25 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 25, marginBottom: 15, paddingHorizontal: 20 },
  inputIcon: { fontSize: 20, marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 16, color: '#333' },
  authButton: { backgroundColor: '#fff', borderRadius: 25, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  authButtonText: { color: '#fd297b', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  switchText: { color: '#fff', textAlign: 'center', marginTop: 20, fontSize: 14, fontWeight: '600' },
  errorText: { color: '#fff', textAlign: 'center', marginBottom: 15, fontSize: 14, fontWeight: '600' },
  demoSection: { marginTop: 40, alignItems: 'center' },
  demoButton: { paddingVertical: 12, paddingHorizontal: 35, borderRadius: 25, borderWidth: 2, borderColor: '#fff' },
  demoButtonText: { color: '#fff', fontWeight: 'bold' },
  swipeContainer: { flex: 1, backgroundColor: '#f5f7fa' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 10, paddingBottom: 10, backgroundColor: '#f5f7fa' },
  headerLogo: { fontSize: 26, fontWeight: '800', color: '#fd297b', letterSpacing: -1 },
  cardsContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 10 },
  card: { position: 'absolute', width: SCREEN_WIDTH * 0.95, height: SCREEN_HEIGHT * 0.68, borderRadius: 15, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 8, overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', backgroundColor: 'rgba(0,0,0,0.5)' },
  cardContent: { position: 'absolute', bottom: 0, padding: 20, width: '100%' },
  cardTitle: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 5 },
  cardAge: { fontSize: 26, fontWeight: '400' },
  cardLocation: { fontSize: 16, color: '#fff', marginBottom: 5, fontWeight: '600' },
  cardDetail: { fontSize: 15, color: '#e0e0e0', marginBottom: 10 },
  amenityTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityTag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  amenityText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  stampContainer: { position: 'absolute', top: 50, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 5, borderWidth: 4 },
  likeStamp: { right: 40, borderColor: '#37e096', transform: [{ rotate: '15deg' }] },
  nopeStamp: { left: 40, borderColor: '#fd297b', transform: [{ rotate: '-15deg' }] },
  stampText: { fontSize: 32, fontWeight: '800', letterSpacing: 2, color: '#37e096' },
  nopeText: { color: '#fd297b' },
  buttonsContainer: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10, backgroundColor: '#f5f7fa' },
  actionButton: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 5 },
  smallButton: { width: 50, height: 50, borderRadius: 25 },
  largeButton: { width: 65, height: 65, borderRadius: 32.5 },
  tabBar: { backgroundColor: '#fff', borderTopWidth: 0, elevation: 0, shadowOpacity: 0, height: 60, paddingBottom: 10 },
  resetBtn: { backgroundColor: '#fd297b', padding: 15, borderRadius: 25 },
  resetText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
\;
fs.writeFileSync('App.js', content);
console.log('App.js written successfully.');