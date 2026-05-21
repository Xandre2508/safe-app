import { ActivityIndicator, Text, View } from 'react-native';
import { styles } from '../styles/VictimDashboardStyles';

export default function NewsSection({ news, loadingNews }) {
  return (
    <View style={styles.newsSectionContainer}>
      <Text style={styles.sectionTitle}>📰 Últimas Notícias</Text>
      
      {loadingNews ? (
        <View style={[styles.statusCard, styles.newsLoadingContainer]}>
          <ActivityIndicator size="large" color="#4361EE" />
          <Text style={styles.newsLoadingText}>A carregar notícias de Portugal...</Text>
        </View>
      ) : news.length > 0 ? (
        news.map((item, index) => (
          <View key={index} style={[styles.statusCard, styles.newsCard]}>
            <Text style={styles.statusTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.infoText} numberOfLines={3}>
              {item.description || 'Clique para ler os detalhes da notícia. Acompanhe a situação atualizada.'}
            </Text>
            <View style={styles.newsSourceRow}>
              <Text style={styles.newsSourceText}>Fonte: {item.source.name}</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.statusCard}>
          <Text style={styles.infoText}>Não foi possível carregar as notícias neste momento.</Text>
        </View>
      )}
    </View>
  );
}