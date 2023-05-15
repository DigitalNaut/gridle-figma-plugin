import type { ChangeEventHandler, Dispatch, SetStateAction } from "react";

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

export function useManagedInputs(
  setState: Dispatch<SetStateAction<GeneratePatternMessage>>
) {
  const handleFrameWidthChange: ChangeEventHandler<HTMLInputElement> = ({
    currentTarget,
  }) => {
    const value = parseInt(currentTarget.value);
    const frameWidth = clamp(value, MIN_FRAME_SIZE, MAX_FRAME_SIZE);

    setState((prev) => {
      const horizontalElementsCount = clamp(
        prev.horizontalElementsCount,
        1,
        frameWidth
      );
      const paddingX = clamp(
        prev.paddingX,
        0,
        frameWidth / horizontalElementsCount - 1
      );

      return {
        ...prev,
        frameWidth,
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
      const verticalElementsCount = clamp(
        prev.verticalElementsCount,
        1,
        frameHeight
      );
      const paddingY = clamp(
        prev.paddingY,
        0,
        frameHeight / verticalElementsCount - 1
      );

      return {
        ...prev,
        frameHeight,
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
      const maxPaddingX = prev.frameWidth / horizontalElementsCount - 1;
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
      const maxPaddingY = prev.frameHeight / verticalElementsCount - 1;
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
      const maxPaddingX = prev.frameWidth / prev.horizontalElementsCount - 1;
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
      const maxPaddingY = prev.frameHeight / prev.verticalElementsCount - 1;
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
    handleHorizontalElementsCountChange,
    handleVerticalElementsCountChange,
    handlePaddingXChange,
    handlePaddingYChange,
  };
}
