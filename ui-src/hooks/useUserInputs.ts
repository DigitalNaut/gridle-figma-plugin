import { ChangeEventHandler, Dispatch, SetStateAction, useState } from "react";

import { clamp } from "utils/math";
import { MIN_FRAME_SIZE, MAX_FRAME_SIZE } from "../constants";

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

export function useManagedInputs(
  setState: Dispatch<SetStateAction<GeneratePatternMessage>>,
  onRecalculateElementWidth: (elementWidth: number) => void,
  onRecalculateElementHeight: (elementHeight: number) => void
) {
  const calculateElementWidth = calculateLength(onRecalculateElementWidth);
  const calculateElementHeight = calculateLength(onRecalculateElementHeight);

  const handleFrameWidthChange: ChangeEventHandler<HTMLInputElement> = ({
    currentTarget,
  }) => {
    const value = parseInt(currentTarget.value);
    const frameWidth = clamp(value, MIN_FRAME_SIZE, MAX_FRAME_SIZE);

    setState((prev) => {
      return {
        ...prev,
        frameWidth,
      };
    });
  };

  const handleFrameWidthChangeDerivedProperties = () => {
    setState((prev) => {
      const horizontalElementsCount = clamp(
        prev.horizontalElementsCount,
        1,
        prev.frameWidth
      );
      const elementWidth = calculateElementWidth(
        prev.frameWidth,
        horizontalElementsCount
      );
      const paddingX = clamp(prev.paddingX, 0, elementWidth - 1);

      return {
        ...prev,
        horizontalElementsCount,
        paddingX,
      };
    });
  };

  const handleFrameHeightChange: ChangeEventHandler<HTMLInputElement> = ({
    currentTarget,
  }) => {
    const value = parseInt(currentTarget.value);
    const frameHeight = clamp(value, MIN_FRAME_SIZE, MAX_FRAME_SIZE);

    setState((prev) => {
      return {
        ...prev,
        frameHeight,
      };
    });
  };

  const handleFrameHeightChangeDerivedProperties = () => {
    setState((prev) => {
      const verticalElementsCount = clamp(
        prev.verticalElementsCount,
        1,
        prev.frameHeight
      );
      const elementHeight = calculateElementHeight(
        prev.frameHeight,
        verticalElementsCount
      );
      const paddingY = clamp(prev.paddingY, 0, elementHeight - 1);

      return {
        ...prev,
        verticalElementsCount,
        paddingY,
      };
    });
  };

  const handleHorizontalElementsCountChange: ChangeEventHandler<
    HTMLInputElement
  > = ({ currentTarget }) => {
    const value = parseInt(currentTarget.value);

    setState((prev) => {
      const horizontalElementsCount = clamp(value, 1, prev.frameWidth);
      const elementWidth = calculateElementWidth(
        prev.frameWidth,
        horizontalElementsCount
      );
      const maxPaddingX = elementWidth - 1;

      return {
        ...prev,
        horizontalElementsCount,
        paddingX: clamp(prev.paddingX, 0, maxPaddingX),
      };
    });
  };

  const handleVerticalElementsCountChange: ChangeEventHandler<
    HTMLInputElement
  > = ({ currentTarget }) => {
    const value = parseInt(currentTarget.value);

    setState((prev) => {
      const verticalElementsCount = clamp(value, 1, prev.frameHeight);
      const elementHeight = calculateElementHeight(
        prev.frameHeight,
        verticalElementsCount
      );
      const maxPaddingY = elementHeight - 1;

      return {
        ...prev,
        verticalElementsCount,
        paddingY: clamp(prev.paddingY, 0, maxPaddingY),
      };
    });
  };

  const handlePaddingXChange: ChangeEventHandler<HTMLInputElement> = ({
    currentTarget,
  }) => {
    const value = parseFloat(currentTarget.value);

    setState((prev) => {
      const elementWidth = calculateElementWidth(
        prev.frameWidth,
        prev.horizontalElementsCount
      );
      const maxPaddingX = elementWidth - 1;
      const paddingX = clamp(value, 0, maxPaddingX);

      return {
        ...prev,
        paddingX,
      };
    });
  };

  const handlePaddingYChange: ChangeEventHandler<HTMLInputElement> = ({
    currentTarget,
  }) => {
    const value = parseFloat(currentTarget.value);

    setState((prev) => {
      const elementHeight = calculateElementHeight(
        prev.frameHeight,
        prev.verticalElementsCount
      );
      const maxPaddingY = elementHeight - 1;
      const paddingY = clamp(value, 0, maxPaddingY);

      return {
        ...prev,
        paddingY,
      };
    });
  };

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
