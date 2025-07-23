// app/components/Onboarding.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserPreferencesService } from '../../services/UserPreferences';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const pages = [
    {
      title: "Welcome to QuRe",
      subtitle: "Turn your lock screen into a powerful QR code display",
      description: "Create beautiful wallpapers with your QR codes integrated seamlessly",
      gradient: ['#ff7e5f', '#feb47b'],
      icon: '📱'
    },
    {
      title: "Endless Possibilities",
      subtitle: "One QR code, countless applications",
      description: "Links for events, business cards for networking, payment codes for transactions, social profiles for growth, and so much more",
      gradient: ['#2193b0', '#6dd5ed'],
      icon: '🌟'
    },
    {
      title: "Design & Customize",
      subtitle: "Make it uniquely yours",
      description: "Beautiful gradients, custom colors, logos, and designs that match your style",
      gradient: ['#cc2b5e', '#753a88'],
      icon: '🎨'
    },
    {
      title: "Swipe to Explore",
      subtitle: "Change your vibe instantly",
      description: "Swipe left or right to change your wallpaper gradient and find the perfect look",
      gradient: ['#4facfe', '#00f2fe'],
      icon: '👆'
    },
    {
      title: "Premium Features",
      subtitle: "Unlock the full potential",
      description: "Add a second QR code, premium designs, remove watermarks, and access exclusive features",
      gradient: ['#348F50', '#56B4D3'],
      icon: '✨'
    }
  ];

  const handleNext = () => {
    if (currentIndex < pages.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: SCREEN_WIDTH * (currentIndex + 1),
        animated: true
      });
    }
  };

  const handleGetStarted = async () => {
    await UserPreferencesService.setOnboardingComplete(true);
    onComplete();
  };

  return (
    <View style={styles.container}>
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
            key={index}
            colors={page.gradient}
            style={styles.page}
          >
            <View style={styles.content}>
              <Text style={styles.icon}>{page.icon}</Text>
              <Text style={styles.title}>{page.title}</Text>
              <Text style={styles.subtitle}>{page.subtitle}</Text>
              <Text style={styles.description}>{page.description}</Text>
              
              {/* Special content for the QR types page */}
              {index === 1 && (
                <View style={styles.examplesContainer}>
                  <View style={styles.exampleRow}>
                    <View style={styles.exampleItem}>
                      <Text style={styles.exampleIcon}>🔗</Text>
                      <Text style={styles.exampleText}>Event tickets</Text>
                    </View>
                    <View style={styles.exampleItem}>
                      <Text style={styles.exampleIcon}>💳</Text>
                      <Text style={styles.exampleText}>PayPal payments</Text>
                    </View>
                  </View>
                  <View style={styles.exampleRow}>
                    <View style={styles.exampleItem}>
                      <Text style={styles.exampleIcon}>📸</Text>
                      <Text style={styles.exampleText}>Social profiles</Text>
                    </View>
                    <View style={styles.exampleItem}>
                      <Text style={styles.exampleIcon}>₿</Text>
                      <Text style={styles.exampleText}>Crypto wallets</Text>
                    </View>
                  </View>
                  <View style={styles.exampleRow}>
                    <View style={styles.exampleItem}>
                      <Text style={styles.exampleIcon}>👤</Text>
                      <Text style={styles.exampleText}>Business cards</Text>
                    </View>
                    <View style={styles.exampleItem}>
                      <Text style={styles.exampleIcon}>💬</Text>
                      <Text style={styles.exampleText}>WhatsApp chats</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </LinearGradient>
        ))}
      </Animated.ScrollView>

      <View style={styles.pagination}>
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

      <View style={styles.footer}>
        {currentIndex === pages.length - 1 ? (
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity onPress={handleGetStarted}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  icon: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  examplesContainer: {
    marginTop: 30,
    width: '100%',
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  exampleItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  exampleIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  exampleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: 120,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  nextText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  getStartedButton: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    flex: 1,
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});