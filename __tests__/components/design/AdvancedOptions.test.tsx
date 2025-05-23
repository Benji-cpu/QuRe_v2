import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { AdvancedOptions } from '../../../components/design/AdvancedOptions';
import { ERROR_CORRECTION_LEVELS } from '../../../constants/ErrorCorrectionLevels';

jest.mock('@react-native-community/slider', () => {
  const { View } = require('react-native');
  return function MockSlider(props) {
    return (
      <View
        testID="slider"
        onValueChange={props.onValueChange}
        value={props.value}
      />
    );
  };
});

describe('AdvancedOptions Component', () => {
  const mockProps = {
    errorCorrectionLevel: 'M',
    onErrorCorrectionChange: jest.fn(),
    quietZone: 4,
    onQuietZoneChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByText, getByTestId } = render(<AdvancedOptions {...mockProps} />);
    
    expect(getByText('Advanced Options')).toBeTruthy();
    expect(getByText('Error Correction Level')).toBeTruthy();
    expect(getByText('Quiet Zone (Margin)')).toBeTruthy();
    expect(getByTestId('slider')).toBeTruthy();
  });

  it('displays all error correction levels', () => {
    const { getByText } = render(<AdvancedOptions {...mockProps} />);
    
    ERROR_CORRECTION_LEVELS.forEach(level => {
      expect(getByText(level.label)).toBeTruthy();
    });
  });

  it('highlights the currently selected error correction level', () => {
    const { getByText } = render(<AdvancedOptions {...mockProps} />);
    
    const mediumLevel = ERROR_CORRECTION_LEVELS.find(level => level.level === 'M');
    if (mediumLevel) {
      const selectedLevelElement = getByText(mediumLevel.label);
      // Verify that the parent view has the selected style
      // (This might need adjusting based on how you detect the selected state in your test)
      expect(selectedLevelElement.parent.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: expect.any(String) })
      );
    }
  });

  it('calls onErrorCorrectionChange when a level is pressed', () => {
    const { getByText } = render(<AdvancedOptions {...mockProps} />);
    
    const lowLevel = ERROR_CORRECTION_LEVELS.find(level => level.level === 'L');
    if (lowLevel) {
      fireEvent.press(getByText(lowLevel.label));
      expect(mockProps.onErrorCorrectionChange).toHaveBeenCalledWith('L');
    }
  });

  it('displays the current quiet zone value', () => {
    const { getByText } = render(<AdvancedOptions {...mockProps} />);
    
    expect(getByText('4')).toBeTruthy();
  });

  it('calls onQuietZoneChange when slider value changes', () => {
    const { getByTestId } = render(<AdvancedOptions {...mockProps} />);
    
    const slider = getByTestId('slider');
    fireEvent(slider, 'valueChange', 8);
    
    expect(mockProps.onQuietZoneChange).toHaveBeenCalledWith(8);
  });

  it('displays recovery capability info for the selected level', () => {
    const { getByText } = render(<AdvancedOptions {...mockProps} />);
    
    const mediumLevel = ERROR_CORRECTION_LEVELS.find(level => level.level === 'M');
    if (mediumLevel) {
      expect(getByText(mediumLevel.recoveryCapability)).toBeTruthy();
    }
  });
});