import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { QRCodeCard } from '../../components/QRCodeCard';
import { Colors } from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { QRCodeContext } from '../../context/QRCodeContext';
import { QRCode } from '../../types/qr-code';
import { formatDate } from '../../utils/dateUtils';

export default function HistoryScreen() {
  const {
    qrHistory,
    primaryQRCode,
    secondaryQRCode,
    updateSlot,
    deleteQRCode,
    refreshHistory,
    loading,
  } = useContext(QRCodeContext);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Group QR codes by date
  const groupedQRCodes = React.useMemo(() => {
    const grouped: Record<string, QRCode[]> = {};
    
    qrHistory.forEach(qrCode => {
      const date = formatDate(qrCode.createdAt);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(qrCode);
    });
    
    return Object.entries(grouped)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([date, codes]) => ({
        date,
        codes: codes.sort((a, b) => b.updatedAt - a.updatedAt),
      }));
  }, [qrHistory]);

  useEffect(() => {
    if (groupedQRCodes.length > 0 && !selectedDate) {
      setSelectedDate(groupedQRCodes[0].date);
    }
  }, [groupedQRCodes, selectedDate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshHistory();
    setRefreshing(false);
  };

  const handleEditQR = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/modal/create-qr',
      params: { id }
    });
  };

  const handleDeleteQR = (id: string) => {
    Alert.alert(
      'Delete QR Code',
      'Are you sure you want to delete this QR code?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await deleteQRCode(id);
            } catch (error) {
              console.error('Error deleting QR code:', error);
              Alert.alert('Error', 'Failed to delete QR code');
            }
          },
        },
      ]
    );
  };

  const handleAddToSlot = (id: string) => {
    Alert.alert(
      'Add to Slot',
      'Select a slot to add this QR code to',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Primary Slot',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await updateSlot('primarySlot', id);
            } catch (error) {
              console.error('Error updating primary slot:', error);
              Alert.alert('Error', 'Failed to update primary slot');
            }
          },
        },
        {
          text: 'Secondary Slot',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await updateSlot('secondarySlot', id);
            } catch (error) {
              console.error('Error updating secondary slot:', error);
              Alert.alert('Error', 'Failed to update secondary slot');
            }
          },
        },
      ]
    );
  };

  const renderDateSelector = () => {
    return (
      <View style={styles.dateContainer}>
        <FlatList
          data={groupedQRCodes}
          keyExtractor={(item) => item.date}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.dateItem,
                selectedDate === item.date && styles.selectedDateItem,
              ]}
              onPress={() => setSelectedDate(item.date)}
            >
              <Text
                style={[
                  styles.dateText,
                  selectedDate === item.date && styles.selectedDateText,
                ]}
              >
                {item.date}
              </Text>
              <Text style={styles.countText}>{item.codes.length}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.dateList}
        />
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="clock" size={60} color={Colors.inactive} />
        <Text style={styles.emptyTitle}>No QR Codes Yet</Text>
        <Text style={styles.emptyDescription}>
          Create your first QR code to see it here
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/modal/create-qr')}
        >
          <Text style={styles.createButtonText}>Create QR Code</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQRCodeItem = ({ item }: { item: QRCode }) => {
    const isPrimary = primaryQRCode?.id === item.id;
    const isSecondary = secondaryQRCode?.id === item.id;

    return (
      <View style={styles.qrItem}>
        <QRCodeCard
          qrCode={item}
          size="medium"
          showInfo={false}
          style={styles.qrCard}
        />

        <View style={styles.qrInfo}>
          <Text style={styles.qrLabel} numberOfLines={1}>
            {item.label}
          </Text>
          <Text style={styles.qrType}>{item.type.toUpperCase()}</Text>

          {(isPrimary || isSecondary) && (
            <View style={styles.slotBadge}>
              <Text style={styles.slotBadgeText}>
                {isPrimary ? 'Primary' : 'Secondary'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditQR(item.id)}
          >
            <Feather name="edit-2" size={18} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAddToSlot(item.id)}
          >
            <Feather name="grid" size={18} color={Colors.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteQR(item.id)}
          >
            <Feather name="trash-2" size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const selectedDateQRCodes = selectedDate
    ? groupedQRCodes.find((group) => group.date === selectedDate)?.codes || []
    : [];

  return (
    <View style={styles.container}>
      {qrHistory.length === 0 ? (
        <View style={styles.container}>
          {renderEmptyState()}
        </View>
      ) : (
        <>
          {renderDateSelector()}

          <FlatList
            data={selectedDateQRCodes}
            keyExtractor={(item) => item.id}
            renderItem={renderQRCodeItem}
            contentContainerStyle={styles.qrList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
          />
        </>
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push('/modal/create-qr')}
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  dateContainer: {
    padding: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'white',
  },
  dateList: {
    paddingRight: Layout.spacing.m,
  },
  dateItem: {
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.m,
    marginRight: Layout.spacing.s,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedDateItem: {
    backgroundColor: Colors.primary,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  selectedDateText: {
    color: 'white',
  },
  countText: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  qrList: {
    padding: Layout.spacing.m,
  },
  qrItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  qrCard: {
    marginRight: Layout.spacing.m,
  },
  qrInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  qrType: {
    fontSize: 12,
    color: '#777',
    textTransform: 'uppercase',
  },
  slotBadge: {
    backgroundColor: Colors.primary,
    paddingVertical: 2,
    paddingHorizontal: Layout.spacing.s,
    borderRadius: Layout.borderRadius.small,
    alignSelf: 'flex-start',
    marginTop: Layout.spacing.xs,
  },
  slotBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    paddingLeft: Layout.spacing.s,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Layout.spacing.m,
    marginBottom: Layout.spacing.xs,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: Layout.spacing.l,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.l,
    borderRadius: Layout.borderRadius.medium,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: Layout.spacing.l,
    right: Layout.spacing.l,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});