import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'; // <-- Adicionado ScrollView, KeyboardAvoidingView e Platform
import { auth, db } from '../firebaseConfig';
import { styles } from '../styles/ProfileScreenStyles';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [nome, setNome] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (auth.currentUser) {
          const docRef = doc(db, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setNome(data.nome || '');
            setProfileImage(data.profileImage || null); 
          }
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar o perfil.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, 
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri); 
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(docRef, { 
        nome: nome,
        profileImage: profileImage 
      });
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A5276" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* O KeyboardAvoidingView e ScrollView garantem que o conteúdo seja "scrollável" */}
      <KeyboardAvoidingView 
        style={{ flex: 1, width: '100%' }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center',  paddingBottom: 20 }} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>O Meu Perfil</Text>

            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={handlePickImage}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={{ fontSize: 50 }}>👤</Text>
                  </View>
                )}
                
                <View style={styles.editAvatarButton}>
                  <Text style={{ fontSize: 16, color: '#FFF' }}>📷</Text>
                </View>
              </TouchableOpacity>
            </View>

            {userData?.organizacao && (
              <View style={styles.orgBadge}>
                <Text style={styles.orgBadgeTitle}>Vínculo Profissional:</Text>
                <Text style={styles.orgBadgeName}>{userData.organizacao}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cargo / Tipo de Conta</Text>
              <TextInput 
                style={styles.disabledInput} 
                value={userData?.role.toUpperCase()} 
                editable={false} 
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Associado</Text>
              <TextInput 
                style={styles.disabledInput} 
                value={userData?.email} 
                editable={false} 
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput 
                style={styles.input} 
                value={nome} 
                onChangeText={setNome} 
                placeholder="O seu nome..."
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Guardar Alterações</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}> Voltar ao Dashboard</Text>
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}