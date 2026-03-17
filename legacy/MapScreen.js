import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, FlatList, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_URL } from './App';

export default function MapScreen() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      const response = await axios.get(`${API_URL}/shelters`);
      setShelters(response.data);
    } catch (error) {
      console.error("Failed to load map data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (beds) => {
    if (beds <= 5) return '#FF6B6B'; // Red for very few beds
    if (beds <= 15) return '#FFB347'; // Orange
    return '#38ef7d'; // Green for available
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={{ marginTop: 10 }}>Loading Live Map...</Text>
      </View>
    );
  }

  // Fallback map view using FlatList and distances/status since react-native-maps is not present and web iframe works only on web
  // We'll mimic a 'map' functionality by showing detailed status and distances.
  
  const MapItem = ({ item }) => (
    <View style={styles.mapCard}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.availableBeds) }]}>
          <Text style={styles.statusText}>{item.availableBeds} beds left</Text>
        </View>
      </View>
      
      <Text style={styles.location}>📍 {item.location}</Text>
      <Text style={styles.coordinates}>Lat: {item.coordinates?.latitude} | Lng: {item.coordinates?.longitude}</Text>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => {
          const url = Platform.OS === 'web' 
            ? `https://maps.google.com/?q=${item.coordinates?.latitude},${item.coordinates?.longitude}`
            : `google.navigation:q=${item.coordinates?.latitude},${item.coordinates?.longitude}`;
          Linking.openURL(url);
        }}
      >
        <Text style={styles.navText}>Get Directions 🗺️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Map & Status</Text>
      </View>
      <FlatList
        data={shelters}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MapItem item={item} />}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333'
  },
  listContainer: {
    padding: 15,
  },
  mapCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  location: {
    fontSize: 15,
    color: '#666',
    marginBottom: 5,
  },
  coordinates: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 15,
  },
  navButton: {
    backgroundColor: '#667eea',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  navText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  }
});