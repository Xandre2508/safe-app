// src/components/NewsSection.js
// Componente para exibir as últimas notícias relacionadas com a situação em Portugal 
// esta merda É USADA NO VICTIM DASHBOARD OBG 

// AQUI ESTÁ A CORREÇÃO: ScrollView adicionado ao import!
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { styles } from '../../styles/VictimDashboardStyles';

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

       /* AQUI ESTÁ A MAGIA: Uma View com altura máxima e o ScrollView lá dentro */
       <View style={{ maxHeight: 350 }}>
         <ScrollView
           showsVerticalScrollIndicator={true}
           nestedScrollEnabled={true} // <-- OBRIGATÓRIO no Android para o scroll funcionar dentro de outro scroll
         >
           {news.map((item, index) => (
             <View key={index} style={[styles.statusCard, styles.newsCard]}>
               <Text style={styles.statusTitle} numberOfLines={2}>{item.title}</Text>
               <Text style={styles.infoText} numberOfLines={3}>
                 {item.description || 'Clique para ler os detalhes da notícia. Acompanhe a situação atualizada.'}
               </Text>
               <View style={styles.newsSourceRow}>
                 <Text style={styles.newsSourceText}>Fonte: {item.source.name}</Text>
               </View>
             </View>
           ))}
         </ScrollView>
       </View>

     ) : (
       <View style={styles.statusCard}>
         <Text style={styles.infoText}>Não foi possível carregar as notícias neste momento.</Text>
       </View>
     )}
   </View>
 );
}