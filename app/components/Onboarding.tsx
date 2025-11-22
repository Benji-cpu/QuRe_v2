// app/components/Onboarding.tsx
import { Feather, FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserPreferencesService } from '../../services/UserPreferences';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingProps {
  onComplete: () => void;
}

type OnboardingPage = {
  id: string;
  eyebrow?: string;
  title: string;
  highlights?: string[];
  gradient: readonly [string, string];
  showLogo?: boolean;
  ctaLabel?: string;
  illustration?: 'logo' | 'social' | 'whatsapp' | 'steps';
  listType?: 'check' | 'number';
};

export default function Onboarding({ onComplete }: OnboardingProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const insets = useSafeAreaInsets();

  const pages: OnboardingPage[] = useMemo(
    () => [
      {
        id: 'welcome',
        showLogo: true,
        eyebrow: 'Welcome to QuRe',
        title: 'Share what matters without unlocking your phone',
        gradient: ['#0F0F0F', '#161616'] as const,
        illustration: 'logo',
      },
      {
        id: 'social',
        title: 'Put any profile front and centre',
        highlights: [
          'Share WhatsApp, Instagram, TikTok, or any link anytime',
          'Match backgrounds to your personal brand',
          'Show the right identity wherever you meet'
        ],
        gradient: ['#101010', '#1B1B1B'] as const,
        illustration: 'social',
      },
      {
        id: 'whatsapp',
        title: 'Share WhatsApp in under a second',
        highlights: [
          'Skip the seven taps to your WhatsApp QR',
          'Perfect for quick intros and networking',
          'Stay in control of what contacts receive'
        ],
        gradient: ['#111111', '#1C1C1C'] as const,
        illustration: 'whatsapp',
      },
      {
        id: 'steps',
        eyebrow: '3 quick steps',
        title: 'Choose · Save · Share',
        highlights: [
          'Choose the QR code you need',
          'Save it to your lock screen in seconds',
          'Share instantly—just ask them to scan'
        ],
        gradient: ['#141414', '#1F1F1F'] as const,
        ctaLabel: 'Create my first QR',
        illustration: 'steps',
        listType: 'number',
      },
    ],
    []
  );

  const handleGetStarted = async () => {
    await UserPreferencesService.setOnboardingComplete(true);
    onComplete();
  };

  const isLastPage = currentIndex === pages.length - 1;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.closeButton, 
          { top: Math.max(insets.top, 0) + 14 }
        ]} 
        onPress={handleGetStarted} 
        hitSlop={16}
      >
        <Feather name="x" size={22} color="white" />
      </TouchableOpacity>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      >
        {pages.map((page, index) => (
          <LinearGradient
            key={page.id}
            colors={page.gradient}
            style={styles.page}
          >
            <View style={styles.content}>
              {renderIllustration(page.illustration ?? (page.showLogo ? 'logo' : undefined))}
              {page.eyebrow && <Text style={styles.eyebrow}>{page.eyebrow}</Text>}
              <Text style={styles.title}>{page.title}</Text>
              {page.highlights && (
                <View
                  style={[
                    styles.highlights,
                    page.listType === 'number' && styles.numberedHighlights,
                  ]}
                >
                  {page.highlights.map((item, itemIndex) => (
                    <View
                      key={`${page.id}-highlight-${itemIndex}`}
                      style={[
                        styles.highlightRow,
                        page.listType === 'number' && styles.numberRow,
                      ]}
                    >
                      {page.listType === 'number' ? (
                        <View style={styles.numberBadge}>
                          <Text style={styles.numberBadgeText}>{itemIndex + 1}</Text>
                        </View>
                      ) : (
                        <Feather name="check" size={16} color="white" style={styles.highlightIcon} />
                      )}
                      <Text style={styles.highlightText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </LinearGradient>
        ))}
      </Animated.ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 40) }]}>
        <View style={[styles.pagination, isLastPage && styles.paginationWithButton]}>
          {pages.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH
            ];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 20, 8],
              extrapolate: 'clamp'
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp'
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity
                  }
                ]}
              />
            );
          })}
        </View>

        {isLastPage && (
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
            <Text style={styles.getStartedText}>{pages[currentIndex].ctaLabel ?? 'Get Started'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const renderLogoMark = () => (
  <View style={styles.logoFrame}>
    <Image
      source={require('../../assets/icons/icon.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  </View>
);

const renderIllustration = (type?: OnboardingPage['illustration']) => {
  switch (type) {
    case 'logo':
      return renderLogoMark();
    case 'social': {
      const nodes = [
        {
          key: 'instagram',
          style: styles.clusterInstagram,
          icon: <FontAwesome name="instagram" size={30} color="#E4405F" />,
        },
        {
          key: 'whatsapp',
          style: styles.clusterWhatsApp,
          icon: <FontAwesome name="whatsapp" size={26} color="#25D366" />,
        },
        {
          key: 'tiktok',
          style: styles.clusterTikTok,
          icon: <FontAwesome5 name="tiktok" size={24} color="#FFFFFF" />,
        },
        {
          key: 'linkedin',
          style: styles.clusterLinkedIn,
          icon: <FontAwesome name="linkedin" size={24} color="#0A66C2" />,
        },
        {
          key: 'twitter',
          style: styles.clusterTwitter,
          icon: <FontAwesome name="twitter" size={24} color="#1DA1F2" />,
        },
        {
          key: 'link',
          style: styles.clusterLink,
          icon: <MaterialIcons name="link" size={24} color="#FFFFFF" />,
        },
      ];

      return (
        <View style={styles.socialCluster}>
          {nodes.map(node => (
            <View key={node.key} style={[styles.clusterBubble, node.style]}>
              {node.icon}
            </View>
          ))}
        </View>
      );
    }
    case 'whatsapp':
      return (
        <View style={[styles.illustrationBubble, styles.whatsappBubble]}>
          <FontAwesome name="whatsapp" size={38} color="#25D366" />
        </View>
      );
    case 'steps':
      return renderLogoMark();
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 54,
    right: 24,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  logoFrame: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  logo: {
    width: 112,
    height: 112,
    borderRadius: 30,
  },
  eyebrow: {
    fontSize: 14,
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.65)',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  highlights: {
    alignSelf: 'stretch',
    marginTop: 4,
    marginBottom: 24,
    gap: 14,
  },
  numberedHighlights: {
    gap: 18,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  numberRow: {
    alignItems: 'center',
  },
  highlightIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  numberBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  highlightText: {
    flex: 1,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.92)',
    lineHeight: 22,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  paginationWithButton: {
    marginBottom: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    alignItems: 'center',
    gap: 20,
  },
  getStartedButton: {
    width: '100%',
    minHeight: 52,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(15,15,15,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  getStartedText: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
  illustrationBubble: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  whatsappBubble: {
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.3)',
  },
  socialCluster: {
    width: 210,
    height: 150,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  clusterBubble: {
    position: 'absolute',
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterInstagram: {
    width: 84,
    height: 84,
    top: 36,
    left: 63,
    backgroundColor: 'rgba(228,64,95,0.18)',
    borderColor: 'rgba(228,64,95,0.35)',
  },
  clusterWhatsApp: {
    width: 68,
    height: 68,
    bottom: 12,
    left: 22,
    backgroundColor: 'rgba(37,211,102,0.16)',
    borderColor: 'rgba(37,211,102,0.32)',
  },
  clusterTikTok: {
    width: 60,
    height: 60,
    top: 4,
    left: 94,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.22)',
  },
  clusterLinkedIn: {
    width: 64,
    height: 64,
    top: 32,
    left: 4,
    backgroundColor: 'rgba(10,102,194,0.16)',
    borderColor: 'rgba(10,102,194,0.32)',
  },
  clusterTwitter: {
    width: 64,
    height: 64,
    top: 30,
    right: 8,
    backgroundColor: 'rgba(29,161,242,0.16)',
    borderColor: 'rgba(29,161,242,0.32)',
  },
  clusterLink: {
    width: 58,
    height: 58,
    bottom: 18,
    right: 28,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.20)',
  },
});