import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { GradientSelector } from '../../../components/design/GradientSelector';

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, style }) => (
      <View testID="linear-gradient" style={style}>
        {children}
      </View>
    ),
  };
});

jest.mock('../../../components/design/ColorPicker', () => ({
  ColorPicker: ({ label, value, onChange }) => (
    <input 
      data-testid={`color-picker-${label.replace(/\s+/g, '-').toLowerCase()}`}
      value={value} 
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe('GradientSelector Component', () => {
  const mockProps = {
    enabled: false,
    onToggle: jest.fn(),
    startColor: '#FF0000',
    endColor: '#0000FF',
    onStartColorChange: jest.fn(),
    onEndColorChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with gradient disabled', () => {
    const { getByText, queryByTestId } = render(<GradientSelector {...mockProps} />);
    
    expect(getByText('Gradient Background')).toBeTruthy();
    expect(queryByTestId('color-picker-start-color')).toBeFalsy();
    expect(queryByTestId('color-picker-end-color')).toBeFalsy();
  });

  it('renders color pickers when gradient is enabled', () => {
    const { getByTestId } = render(
      <GradientSelector 
        {...mockProps}
        enabled={true} 
      />
    );
    
    expect(getByTestId('color-picker-start-color')).toBeTruthy();
    expect(getByTestId('color-picker-end-color')).toBeTruthy();
  });

  it('calls onToggle when switch is pressed', () => {
    const { getByRole } = render(<GradientSelector {...mockProps} />);
    
    const toggle = getByRole('switch');
    fireEvent(toggle, 'valueChange', true);
    
    expect(mockProps.onToggle).toHaveBeenCalledWith(true);
  });

  it('shows premium banner when premiumGradientsEnabled is false', () => {
    const { getByText } = render(
      <GradientSelector 
        {...mockProps}
        enabled={true}
        premiumGradientsEnabled={false}
      />
    );
    
    expect(getByText('Upgrade to Premium for all gradient options')).toBeTruthy();
  });

  it('does not show premium banner when premiumGradientsEnabled is true', () => {
    const { queryByText } = render(
      <GradientSelector 
        {...mockProps}
        enabled={true}
        premiumGradientsEnabled={true}
      />
    );
    
    expect(queryByText('Upgrade to Premium for all gradient options')).toBeNull();
  });

  it('renders gradient presets when enabled', () => {
    const { getAllByTestId } = render(
      <GradientSelector 
        {...mockProps}
        enabled={true}
      />
    );
    
    const gradients = getAllByTestId('linear-gradient');
    expect(gradients.length).toBeGreaterThan(0);
  });

  it('calls color change handlers when selecting preset', () => {
    const { getAllByTestId } = render(
      <GradientSelector 
        {...mockProps}
        enabled={true}
      />
    );
    
    // Find all TouchableOpacity components (should include gradient presets)
    const touchables = getAllByTestId('linear-gradient');
    // Get the parent of the first gradient which should be the TouchableOpacity
    const presetButton = touchables[0].parent;
    fireEvent.press(presetButton);
    
    expect(mockProps.onStartColorChange).toHaveBeenCalled();
    expect(mockProps.onEndColorChange).toHaveBeenCalled();
  });
});