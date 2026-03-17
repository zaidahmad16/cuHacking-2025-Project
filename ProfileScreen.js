import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, FlatList, Image, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Platform, Animated, Linking, Dimensions 
} from 'react-native';
import axios from 'axios';
import { useAuth, API_URL } from './App';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProfileScreen = () => {
  const [savedShelters, setSavedShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    if (user?.id) {
      fetchSavedShelters();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSavedShelters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/saved-shelters`, {
        params: { userId: user.id }
      });
      setSavedShelters(response.data);
    } catch (error) {
      console.error("Error fetching saved shelters:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeShelter = async (shelterId) => {
    try {
      await axios.delete(`${API_URL}/saved-shelters/${shelterId}`, {
        params: { userId: user.id }
      });
      setSavedShelters(prev => prev.filter(s => s.id !== shelterId));
    } catch (error) {
      console.error("Error removing shelter:", error);
    }
  };

  const renderShelterCard = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.shelterCard,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })
          }]
        }
      ]}
    >
      <Image source={{ uri: item.image }} style={styles.shelterImage} />
      <View style={styles.shelterContent}>
        <Text style={styles.shelterName}>{item.name}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
          <Text style={styles.shelterLocation}>{item.location}</Text>
        </View>
        {item.gender && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👥</Text>
            <Text style={styles.infoText}>{item.gender}</Text>
            {item.capacity !== undefined && item.availableBeds !== undefined && (
                <View style={[styles.capacityIndicatorList, { backgroundColor: item.availableBeds > 10 ? '#4CAF50' : (item.availableBeds > 3 ? '#FFC107' : '#F44336') }]}>
                  <Text style={styles.capacityTextList}>{item.availableBeds} beds available</Text>
                </View>
              )}
          </View>
        )}
        {item.amenities && item.amenities.length > 0 && (
          <View style={styles.amenitiesRow}>
            {item.amenities.slice(0, 3).map((amenity, i) => (
              <View key={i} style={styles.amenityChip}>
                <Text style={styles.amenityChipText}>{amenity}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.actionRow}>
          {item.phone && (
            <TouchableOpacity 
              style={styles.callButton}
              onPress={() => Linking.openURL(`tel:${item.phone}`)}
            >
              <Text style={styles.callButtonText}>📞 Call Now</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => removeShelter(item.id)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerGradient} />
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '👤'}
            </Text>
          </View>
          <View style={{ alignItems: 'center', marginTop: 15 }}>
            <TouchableOpacity style={styles.emergencyBtnProfile} onPress={() => Linking.openURL('tel:911')}>
              <Text style={styles.emergencyBtnText}>🚨 Emergency Help</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{savedShelters.length}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>6</Text>
          <Text style={styles.statLabel}>Ottawa Shelters</Text>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.sectionTitle}>⭐ Your Saved Shelters</Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>Loading your shelters...</Text>
        </View>
      ) : savedShelters.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏠</Text>
          <Text style={styles.emptyTitle}>No Saved Shelters</Text>
          <Text style={styles.emptyText}>
            Swipe right on shelters you like to save them here for quick access.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedShelters}
          renderItem={renderShelterCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#0D9488',
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0369A1',
    opacity: 0.5,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 15,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0D9488',
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#888',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  capacityIndicatorList: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 10,
    },
    capacityTextList: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    emergencyBtnProfile: {
      backgroundColor: '#f44336',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 5,
    },
    emergencyBtnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    listContent: {
    padding: 20,
    paddingTop: 10,
  },
  shelterCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  shelterImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#eee',
  },
  shelterContent: {
    padding: 20,
  },
  shelterName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  shelterLocation: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
  },
  
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  amenityChip: {
    backgroundColor: '#0D948815',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  amenityChipText: {
    color: '#0D9488',
    fontSize: 12,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#38ef7d',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  removeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0D9488',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#0D9488',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ProfileScreen;
