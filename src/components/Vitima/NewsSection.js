import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { styles } from '../../styles/VictimDashboardStyles';

export default function NewsSection({ news, loadingNews }) {
  return (
    <View style={styles.newsSectionContainer}>
      <Text style={styles.sectionTitle}>📰 Avisos e Alertas Oficiais</Text>

      {loadingNews ? (
        <View style={[styles.statusCard, styles.newsLoadingContainer]}>
          <ActivityIndicator size="small" color="#4361EE" />
          <Text style={styles.newsLoadingText}>A carregar comunicados em tempo real...</Text>
        </View>
      ) : news && news.length > 0 ? (
        <View style={{ maxHeight: 360 }}>
          <ScrollView
            showsVerticalScrollIndicator
            nestedScrollEnabled
          >
            {news.map((item, index) => (
              <View key={index} style={[styles.statusCard, styles.newsCard]}>
                <Text style={styles.statusTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.infoText} numberOfLines={3}>
                  {item.description || 'Consulte os avisos da Proteção Civil e cumpra as diretrizes de segurança emitidas pelas autoridades competentes.'}
                </Text>
                <View style={styles.newsSourceRow}>
                  <Text style={styles.newsSourceText}>Fonte: {item.source?.name || 'Proteção Civil'}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.statusCard}>
          <Text style={styles.infoText}>Não existem alertas adicionais para a sua região no momento.</Text>
        </View>
      )}
    </View>
  );
}
