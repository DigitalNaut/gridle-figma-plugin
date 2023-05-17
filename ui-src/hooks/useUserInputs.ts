import type {
  ChangeEvent,
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
} from "react";

import { clamp } from "utils/math";
import { MIN_FRAME_SIZE, MAX_FRAME_SIZE } from "../constants";
import { KeysOfType } from "types/utils";

type StateSetter = Dispatch<SetStateAction<GeneratePatternMessage>>;

export function useBasicInputs(
  setState: Dispatch<SetStateAction<GeneratePatternMessage>>
) {
  const handleSelectChange: ChangeEventHandler<HTMLSelectElement> = ({
    currentTarget: { name, value },
  }) => setState((prev) => ({ ...prev, [name]: value }));

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = ({
    currentTarget: { name, value },
  }) => setState((prev) => ({ ...prev, [name]: value }));

  const handleCheckboxChange: ChangeEventHandler<HTMLInputElement> = ({
    currentTarget: { name, checked },
  }) => setState((prev) => ({ ...prev, [name]: checked }));

  return {
    handleSelectChange,
    handleInputChange,
    handleCheckboxChange,
  };
}

function calculateLength(callback: (result: number) => void) {
  return function (length: number, parts: number) {
    const result = length / parts;
    callback(result);
    return result;
  };
}

function createFrameLengthHandler(
  setState: StateSetter,
  propertyName: keyof GeneratePatternMessage
) {
  return ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(currentTarget.value);
    const clampedValue = clamp(value, MIN_FRAME_SIZE, MAX_FRAME_SIZE);

    setState((prev) => {
      return {
        ...prev,
        [propertyName]: clampedValue,
      };
    });
  };
}

type NumberKeys = KeysOfType<GeneratePatternMessage, number>;

function createDerivedPropertiesAfterLengthChangeHandler(
  setState: StateSetter,
  calculateElementLength: (length: number, parts: number) => number,
  lengthPropertyName: NumberKeys,
  countPropertyName: NumberKeys,
  paddingPropertyName: NumberKeys
) {
  return () => {
    setState((prev) => {
      const prevCount = prev[countPropertyName];
      const prevLength = prev[lengthPropertyName];
      const prevPadding = prev[paddingPropertyName];

      const newCount = clamp(prevCount, 1, prevLength);
      const newLength = calculateElementLength(prevLength, newCount);
      const newPadding = clamp(prevPadding, 0, newLength - 1);

      return {
        ...prev,
        [countPropertyName]: newCount,
        [paddingPropertyName]: newPadding,
      };
    });
  };
}

function createLengthCountChangeHandler(
  setState: StateSetter,
  calculateElementLength: (length: number, parts: number) => number,
  countPropertyName: NumberKeys,
  paddingPropertyName: NumberKeys,
  lengthPropertyName: NumberKeys
) {
  return ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(currentTarget.value);

    setState((prev) => {
      const prevLength = prev[lengthPropertyName];
      const prevPadding = prev[paddingPropertyName];

      const lengthElementsCount = clamp(value, 1, prevLength);
      const elementWidth = calculateElementLength(
        prevLength,
        lengthElementsCount
      );
      const maxPadding = elementWidth - 1;

      return {
        ...prev,
        [countPropertyName]: lengthElementsCount,
        [paddingPropertyName]: clamp(prevPadding, 0, maxPadding),
      };
    });
  };
}

function createLengthPaddingHandler(
  setState: StateSetter,
  calculateElementLength: (length: number, parts: number) => number,
  paddingPropertyName: NumberKeys,
  lengthPropertyName: NumberKeys,
  countPropertyName: NumberKeys
) {
  return ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(currentTarget.value);

    setState((prev) => {
      const prevLength = prev[lengthPropertyName];
      const prevCount = prev[countPropertyName];

      const newElementLength = calculateElementLength(prevLength, prevCount);
      const maxPadding = newElementLength - 1;
      const newPadding = clamp(value, 0, maxPadding);

      return {
        ...prev,
        [paddingPropertyName]: newPadding,
      };
    });
  };
}

export function useManagedInputs(
  setState: StateSetter,
  onRecalculateElementWidth: (elementWidth: number) => void,
  onRecalculateElementHeight: (elementHeight: number) => void
) {
  const calculateElementWidth = calculateLength(onRecalculateElementWidth);
  const calculateElementHeight = calculateLength(onRecalculateElementHeight);

  const handleFrameWidthChange = createFrameLengthHandler(
    setState,
    "frameWidth"
  );

  const handleFrameHeightChange = createFrameLengthHandler(
    setState,
    "frameHeight"
  );

  const handleFrameWidthChangeDerivedProperties =
    createDerivedPropertiesAfterLengthChangeHandler(
      setState,
      calculateElementWidth,
      "frameWidth",
      "horizontalElementsCount",
      "paddingX"
    );

  const handleFrameHeightChangeDerivedProperties =
    createDerivedPropertiesAfterLengthChangeHandler(
      setState,
      calculateElementHeight,
      "frameHeight",
      "verticalElementsCount",
      "paddingY"
    );

  const handleHorizontalElementsCountChange = createLengthCountChangeHandler(
    setState,
    calculateElementWidth,
    "horizontalElementsCount",
    "paddingX",
    "frameWidth"
  );

  const handleVerticalElementsCountChange = createLengthCountChangeHandler(
    setState,
    calculateElementHeight,
    "verticalElementsCount",
    "paddingY",
    "frameHeight"
  );

  const handlePaddingXChange = createLengthPaddingHandler(
    setState,
    calculateElementWidth,
    "paddingX",
    "frameWidth",
    "horizontalElementsCount"
  );

  const handlePaddingYChange = createLengthPaddingHandler(
    setState,
    calculateElementHeight,
    "paddingY",
    "frameHeight",
    "verticalElementsCount"
  );

  return {
    handleFrameWidthChange,
    handleFrameHeightChange,
    handleFrameWidthChangeDerivedProperties,
    handleFrameHeightChangeDerivedProperties,
    handleHorizontalElementsCountChange,
    handleVerticalElementsCountChange,
    handlePaddingXChange,
    handlePaddingYChange,
  };
}
