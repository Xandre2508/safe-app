import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles/OperatorDashboardStyles';

export default function IncidentList({ ocorrencias, pendingCount, onSelectIncident }) {
  return (
    <>
      {pendingCount > 0 && (
        <View style={styles.notificationBanner}>
          <Text style={{ marginRight: 8, fontSize: 16 }}>🔔</Text>
          <Text style={styles.notificationText}>
            Atenção: {pendingCount} pedido(s) em aberto a aguardar resposta tática.
          </Text>
        </View>
      )}

      {/* Resumo de Métricas */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCardActive]}>
          <Text style={styles.statTitle}>Em Aberto</Text>
          <Text style={styles.statNumberActive}>{pendingCount}</Text>
        </View>

        <View style={[styles.statCard, styles.statCardDone]}>
          <Text style={styles.statTitle}>Concluídos</Text>
          <Text style={styles.statNumberDone}>
            {ocorrencias.filter((r) => r.status === 'concluido').length}
          </Text>
        </View>
      </View>

      {/* Listagem de Ocorrências */}
      <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
        {ocorrencias.map((req) => {
          if (req.status === 'cancelado') return null;

          const isPendente = req.status === 'pendente';
          const isMantimento = req.tipoAlerta === 'MANTIMENTO';

          return (
            <TouchableOpacity
              key={req.id}
              style={[styles.incidentCard, isPendente ? styles.incidentCardActive : styles.incidentCardDone]}
              onPress={() => onSelectIncident(req.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.victimName} numberOfLines={1}>
                  {req.userName && req.userName.trim() !== '' ? req.userName : 'Cidadão Não Identificado'}
                </Text>

                <View style={styles.badgesRow}>
                  <View
                    style={[
                      styles.chatBadge,
                      { backgroundColor: isMantimento ? '#EFF6FF' : '#FEF2F2' },
                    ]}
                  >
                    <Text style={{ fontSize: 11, marginRight: 4 }}>{isMantimento ? '📦' : '🚨'}</Text>
                    <Text
                      style={[
                        styles.chatBadgeText,
                        { color: isMantimento ? '#3B82F6' : '#EF4444' },
                      ]}
                    >
                      {isMantimento ? 'Mantimentos' : 'SOS'}
                    </Text>
                  </View>

                  <View style={[styles.badge, isPendente ? styles.badgeActive : styles.badgeDone]}>
                    <Text style={isPendente ? styles.badgeTextActive : styles.badgeTextDone}>
                      {isPendente ? 'PENDENTE' : 'RESOLVIDO'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.coordsContainer}>
                <Text style={{ marginRight: 4 }}>📍</Text>
                <Text style={styles.coordsText}>
                  Lat: {req.latitude ? req.latitude.toFixed(4) : 'N/A'} | Lon:{' '}
                  {req.longitude ? req.longitude.toFixed(4) : 'N/A'}
                </Text>
              </View>

              {req.detalhes && isPendente && (
                <Text style={styles.warningText}>
                  {isMantimento
                    ? `📦 ${req.detalhes.descricao || 'Mantimentos solicitados'}`
                    : `⚠️ ${
                        req.detalhes.criancas
                          ? 'Crianças no local'
                          : req.detalhes.gravida
                          ? 'Grávida no local'
                          : `Idade: ${req.detalhes.idade || 'N/A'}`
                      }`}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
}
