import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';
import { styles } from '../styles/ProfileScreenStyles';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [nome, setNome] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        if (auth.currentUser) {
          const docRef = doc(db, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists() && isMounted) {
            const data = docSnap.data();
            setUserData(data);
            setNome(data.nome || '');
            if (data.profileImage) {
              setProfileImage(data.profileImage);
            }
          }
        }
      } catch (error) {
        console.warn('[ProfileScreen] Erro ao carregar perfil:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    const onBackPress = () => {
      navigation.goBack();
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      isMounted = false;
      backHandlerSubscription.remove();
    };
  }, [navigation]);

  // Seleção de fotografia de perfil com verificação de permissões no Android
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Necessária',
          'Conceda acesso à galeria para alterar a sua fotografia de perfil.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.warn('[ProfileScreen] Erro ao escolher imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem pretendida.');
    }
  };

  const handleUpdateProfile = async () => {
    const cleanNome = nome.trim();
    if (!cleanNome) {
      Alert.alert('Atenção', 'O nome completo não pode estar em branco.');
      return;
    }

    if (!auth.currentUser) {
      Alert.alert('Erro', 'Sessão expirada. Volte a iniciar sessão.');
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(docRef, {
        nome: cleanNome,
        profileImage: profileImage || null,
        updatedAt: new Date().toISOString(),
      });
      Alert.alert('Perfil Atualizado', 'As suas alterações foram guardadas com sucesso.');
    } catch (error) {
      console.warn('[ProfileScreen] Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Ocorreu uma falha ao gravar as alterações.');
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

  const formatRole = (role) => {
    switch (role) {
      case 'vitima':
        return 'Cidadão / Vítima';
      case 'socorrista':
        return 'Socorrista Operacional';
      case 'operador':
        return 'Operador de Central';
      case 'organizacao':
        return 'Administrador de Organização';
      default:
        return (role || 'Utilizador').toUpperCase();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Perfil de Utilizador</Text>

            {/* Avatar do Utilizador */}
            <View style={styles.avatarContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={{ fontSize: 44 }}>👤</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.editAvatarButton}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#FFF', fontSize: 16 }}>📷</Text>
              </TouchableOpacity>
            </View>

            {/* Indicador de Organização */}
            {userData?.organizacao && (
              <View style={styles.orgBadge}>
                <Text style={styles.orgBadgeTitle}>ORGANIZAÇÃO AFETA</Text>
                <Text style={styles.orgBadgeName}>{userData.organizacao}</Text>
              </View>
            )}

            {/* Informação Não-Editável */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Perfil</Text>
              <TextInput
                style={styles.disabledInput}
                value={formatRole(userData?.role)}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Endereço de Email</Text>
              <TextInput
                style={styles.disabledInput}
                value={userData?.email || ''}
                editable={false}
              />
            </View>

            {userData?.nif && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NIF Registado</Text>
                <TextInput
                  style={styles.disabledInput}
                  value={userData.nif}
                  editable={false}
                />
              </View>
            )}

            {/* Nome Editável */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Insira o seu nome..."
                placeholderTextColor="#95A5A6"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateProfile}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar Alterações</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Voltar ao Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
