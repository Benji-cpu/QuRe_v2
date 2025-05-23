import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { ColorPicker } from '../../../components/design/ColorPicker';
import { QRColors } from '../../../constants/Colors';

describe('ColorPicker Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByText, getByPlaceholderText } = render(
      <ColorPicker
        value="#FF0000"
        onChange={mockOnChange}
        label="Test Color"
      />
    );

    expect(getByText('Test Color')).toBeTruthy();
    expect(getByPlaceholderText('#000000')).toBeTruthy();
  });

  it('displays the current color value', () => {
    const { getByDisplayValue } = render(
      <ColorPicker
        value="#FF0000"
        onChange={mockOnChange}
        label="Test Color"
      />
    );

    expect(getByDisplayValue('#FF0000')).toBeTruthy();
  });

  it('updates input when user types', () => {
    const { getByDisplayValue } = render(
      <ColorPicker
        value="#FF0000"
        onChange={mockOnChange}
        label="Test Color"
      />
    );

    const input = getByDisplayValue('#FF0000');
    fireEvent.changeText(input, '#00FF00');
    
    expect(input.props.value).toBe('#00FF00');
  });

  it('calls onChange when input is blurred with valid hex color', () => {
    const { getByDisplayValue } = render(
      <ColorPicker
        value="#FF0000"
        onChange={mockOnChange}
        label="Test Color"
      />
    );

    const input = getByDisplayValue('#FF0000');
    fireEvent.changeText(input, '#00FF00');
    fireEvent.blur(input);
    
    expect(mockOnChange).toHaveBeenCalledWith('#00FF00');
  });

  it('does not call onChange when input is blurred with invalid hex color', () => {
    const { getByDisplayValue } = render(
      <ColorPicker
        value="#FF0000"
        onChange={mockOnChange}
        label="Test Color"
      />
    );

    const input = getByDisplayValue('#FF0000');
    fireEvent.changeText(input, 'invalid');
    fireEvent.blur(input);
    
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('automatically adds # prefix to input when missing', () => {
    const { getByDisplayValue } = render(
      <ColorPicker
        value="#FF0000"
        onChange={mockOnChange}
        label="Test Color"
      />
    );

    const input = getByDisplayValue('#FF0000');
    fireEvent.changeText(input, 'FF00FF');
    
    expect(input.props.value).toBe('#FF00FF');
  });

  it('renders color preset options', () => {
    const { UNSAFE_getAllByType } = render(
      <ColorPicker
        value="#FF0000"
        onChange={mockOnChange}
        label="Test Color"
      />
    );

    // Test if the number of color options matches the default presets
    const colorOptions = UNSAFE_getAllByType('TouchableOpacity');
    // Subtract 1 because there might be other TouchableOpacity elements in the component
    expect(colorOptions.length - 1).toBeGreaterThanOrEqual(QRColors.presets.length);
  });

  it('calls onChange when a preset color is clicked', () => {
    const { UNSAFE_getAllByType } = render(
      <ColorPicker
        value="#FF0000"
        onChange={mockOnChange}
        label="Test Color"
      />
    );

    const colorOptions = UNSAFE_getAllByType('TouchableOpacity');
    // Click the first color option (may need adjusting based on component structure)
    fireEvent.press(colorOptions[1]); // Skip the first one which might be another element
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('uses custom presets when provided', () => {
    const customPresets = ['#111111', '#222222', '#333333'];
    
    const { UNSAFE_getAllByType } = render(
      <ColorPicker
        value="#FF0000"
        onChange={mockOnChange}
        label="Test Color"
        presets={customPresets}
      />
    );

    const colorOptions = UNSAFE_getAllByType('TouchableOpacity');
    // Expect at least as many options as our custom presets
    expect(colorOptions.length - 1).toBeGreaterThanOrEqual(customPresets.length);
  });
});