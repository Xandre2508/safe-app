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
} from 'react-native';
import { auth, db } from '../../src/firebaseConfig';
import { styles } from '../styles/ProfileScreenStyles';

export default function ProfileScreen({ navigation }) {
  // --- ESTADOS ---
  const [userData, setUserData] = useState(null); // Guarda toda a payload do documento Firebase
  const [nome, setNome] = useState(''); // Campo editável de nome
  const [profileImage, setProfileImage] = useState(null); // URI local da imagem escolhida
  const [loading, setLoading] = useState(true); // Loading inicial do ecrã
  const [saving, setSaving] = useState(false); // Loading de gravação (feedback para o botão de save)

  // --- EFEITO: Buscar Perfil da Firestore ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (auth.currentUser) {
          // Busca os dados diretamente associados ao UID que fez login
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
        setLoading(false); // Ecrã pronto para renderizar
      }
    };
    fetchProfile();
  }, []);

  // --- FUNÇÃO: Interagir com a Galeria (Expo Image Picker) ---
  const handlePickImage = async () => {
    // Abre a biblioteca nativa do telemóvel para escolher fotos
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Filtra apenas imagens (sem vídeo)
      allowsEditing: true, // Permite ao utilizador cortar a foto
      aspect: [1, 1], // Força um rácio quadrado (ideal para avatares redondos)
      quality: 0.5, // Comprime a imagem para poupar dados/storage
    });

    if (!result.canceled) {
      // Se não cancelou a seleção, guardamos a URI temporária gerada pelo dispositivo
      setProfileImage(result.assets[0].uri); 
    }
  };

  // --- FUNÇÃO: Guardar Alterações na Firebase ---
  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      // updateDoc só altera os campos que passamos, não apaga o resto do documento (ex: NIF, role, etc)
      await updateDoc(docRef, { 
        nome: nome,
        profileImage: profileImage 
        // Nota Arquitetural: Aqui a profileImage só grava a string da URI local. 
        // No futuro, terás de fazer o upload deste ficheiro real para o Firebase Storage.
      });
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  // --- LOADING INICIAL ---
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A5276" />
      </View>
    );
  }

  // --- UI RENDER ---
  return (
    <SafeAreaView style={styles.container}>
      {/* KeyboardAvoidingView emula o comportamento do teclado empurrando a vista (padding) */}
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

            {/* SECTOR DO AVATAR FOTOGRÁFICO */}
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={handlePickImage}>
                {profileImage ? (
                  // Se houver URI válida (da BD ou nova seleção), renderiza a foto
                  <Image source={{ uri: profileImage }} style={styles.avatar} />
                ) : (
                  // Fallback: Ícone genérico se não tiver foto de perfil
                  <View style={styles.avatarPlaceholder}>
                    <Text style={{ fontSize: 50 }}>👤</Text>
                  </View>
                )}
                
                {/* Ícone pequeno sobreposto a indicar edição */}
                <View style={styles.editAvatarButton}>
                  <Text style={{ fontSize: 16, color: '#FFF' }}>📷</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* RENDERIZAÇÃO CONDICIONAL: Crachá Organizacional */}
            {/* Só é visível se for um Socorrista/Operador vinculado a uma organização (ex: Bombeiros) */}
            {userData?.organizacao && (
              <View style={styles.orgBadge}>
                <Text style={styles.orgBadgeTitle}>Vínculo Profissional:</Text>
                <Text style={styles.orgBadgeName}>{userData.organizacao}</Text>
              </View>
            )}

            {/* SECÇÃO DE DADOS APENAS DE LEITURA (Não Editáveis por Segurança) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cargo / Tipo de Conta</Text>
              <TextInput style={styles.disabledInput} value={userData?.role.toUpperCase()} editable={false} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Associado</Text>
              <TextInput style={styles.disabledInput} value={userData?.email} editable={false} />
            </View>

            {/* DADOS EDITÁVEIS */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput 
                style={styles.input} 
                value={nome} 
                onChangeText={setNome} 
                placeholder="O seu nome..."
              />
            </View>

            {/* Botão de Guardar Alterações com feedback dinâmico */}
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Guardar Alterações</Text>}
            </TouchableOpacity>
          </View>

          {/* Botão de Regresso */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}> Voltar ao Dashboard</Text>
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}