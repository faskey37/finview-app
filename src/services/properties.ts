// services/properties.ts
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import type { Property } from '@/lib/types';

// Helper to get the properties collection reference for the current user
const getPropertiesCollection = () => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not logged in");
  return collection(db, 'users', userId, 'properties');
};

// Helper to get a specific property document reference
const getPropertyDocRef = (propertyId: string) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not logged in");
  return doc(db, 'users', userId, 'properties', propertyId);
};

// Add a new property
export const addProperty = async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const collectionRef = getPropertiesCollection();
    const docRef = await addDoc(collectionRef, {
      ...propertyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding property:", error);
    throw new Error("Failed to add property");
  }
};

// Update an existing property
export const updateProperty = async (id: string, propertyData: Partial<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>>) => {
  try {
    const docRef = getPropertyDocRef(id);
    await updateDoc(docRef, {
      ...propertyData,
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    console.error("Error updating property:", error);
    throw new Error("Failed to update property");
  }
};

// Delete a property
export const deleteProperty = async (id: string) => {
  try {
    const docRef = getPropertyDocRef(id);
    await deleteDoc(docRef);
    return id;
  } catch (error) {
    console.error("Error deleting property:", error);
    throw new Error("Failed to delete property");
  }
};

// Get all properties for the current user
export const getProperties = async (): Promise<Property[]> => {
  try {
    const collectionRef = getPropertiesCollection();
    const q = query(collectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const properties: Property[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      properties.push({
        id: doc.id,
        name: data.name || '',
        propertyType: data.propertyType || 'residential',
        address: data.address || '',
        location: data.location || { lat: 20.5937, lng: 78.9629 },
        purchasePrice: data.purchasePrice || 0,
        estimatedValue: data.estimatedValue || 0,
        squareFeet: data.squareFeet,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        purchaseDate: data.purchaseDate,
        notes: data.notes || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Property);
    });
    
    return properties;
  } catch (error) {
    console.error("Error getting properties:", error);
    throw new Error("Failed to get properties");
  }
};

// Get a single property by ID
export const getPropertyById = async (id: string): Promise<Property | null> => {
  try {
    const docRef = getPropertyDocRef(id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        propertyType: data.propertyType || 'residential',
        address: data.address || '',
        location: data.location || { lat: 20.5937, lng: 78.9629 },
        purchasePrice: data.purchasePrice || 0,
        estimatedValue: data.estimatedValue || 0,
        squareFeet: data.squareFeet,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        purchaseDate: data.purchaseDate,
        notes: data.notes || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Property;
    }
    return null;
  } catch (error) {
    console.error("Error getting property:", error);
    throw new Error("Failed to get property");
  }
};

// Get properties by type
export const getPropertiesByType = async (propertyType: string): Promise<Property[]> => {
  try {
    const collectionRef = getPropertiesCollection();
    const q = query(collectionRef, where('propertyType', '==', propertyType), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const properties: Property[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      properties.push({
        id: doc.id,
        name: data.name || '',
        propertyType: data.propertyType || 'residential',
        address: data.address || '',
        location: data.location || { lat: 20.5937, lng: 78.9629 },
        purchasePrice: data.purchasePrice || 0,
        estimatedValue: data.estimatedValue || 0,
        squareFeet: data.squareFeet,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        purchaseDate: data.purchaseDate,
        notes: data.notes || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Property);
    });
    
    return properties;
  } catch (error) {
    console.error("Error getting properties by type:", error);
    throw new Error("Failed to get properties");
  }
};

// Get total property value
export const getTotalPropertyValue = async (): Promise<number> => {
  try {
    const properties = await getProperties();
    return properties.reduce((total, property) => {
      return total + (property.estimatedValue || property.purchasePrice || 0);
    }, 0);
  } catch (error) {
    console.error("Error calculating total property value:", error);
    throw new Error("Failed to calculate total property value");
  }
};

// Search properties by location
export const searchPropertiesByLocation = async (searchTerm: string): Promise<Property[]> => {
  try {
    const properties = await getProperties();
    // Simple client-side search (for small datasets)
    // For production, consider using Algolia or Firebase Extensions for full-text search
    return properties.filter(property => 
      property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error("Error searching properties:", error);
    throw new Error("Failed to search properties");
  }
};

// Get properties within a radius of coordinates (for future use)
export const getPropertiesNearLocation = async (
  lat: number, 
  lng: number, 
  radiusKm: number
): Promise<Property[]> => {
  try {
    const properties = await getProperties();
    // Simple client-side distance calculation (for small datasets)
    // For production, consider using Geofire or similar
    return properties.filter(property => {
      if (!property.location) return false;
      
      const R = 6371; // Earth's radius in km
      const dLat = (property.location.lat - lat) * Math.PI / 180;
      const dLon = (property.location.lng - lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(property.location.lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return distance <= radiusKm;
    });
  } catch (error) {
    console.error("Error finding nearby properties:", error);
    throw new Error("Failed to find nearby properties");
  }
};

// Batch update property values (for appreciation/depreciation)
export const batchUpdatePropertyValues = async (
  percentageChange: number,
  propertyType?: string
) => {
  try {
    let properties: Property[];
    
    if (propertyType) {
      properties = await getPropertiesByType(propertyType);
    } else {
      properties = await getProperties();
    }
    
    const updatePromises = properties.map(property => {
      const newValue = (property.estimatedValue || property.purchasePrice || 0) * (1 + percentageChange / 100);
      return updateProperty(property.id, { estimatedValue: Math.round(newValue) });
    });
    
    await Promise.all(updatePromises);
    return properties.length;
  } catch (error) {
    console.error("Error batch updating properties:", error);
    throw new Error("Failed to update property values");
  }
};