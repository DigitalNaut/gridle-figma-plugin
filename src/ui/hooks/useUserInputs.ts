import type {
  ChangeEvent,
  ChangeEventHandler,
  Dispatch,
  MouseEventHandler,
  SetStateAction,
} from "react";

import type { PatternDataMessage, KeysOfType } from "@common";
import {
  clamp,
  toInteger,
  MIN_FRAME_SIZE,
  MAX_FRAME_SIZE,
} from "@common";

type StateSetter = Dispatch<SetStateAction<PatternDataMessage>>;

export function useBasicInputs(
  setState: Dispatch<SetStateAction<PatternDataMessage>>,
) {
  const handleStringInputChange: ChangeEventHandler<
    HTMLSelectElement | HTMLInputElement
  > &
    MouseEventHandler<HTMLButtonElement> = ({
    currentTarget: { name, value },
  }) => setState((prev) => ({ ...prev, [name]: value }));

  const handleNumberInputChange: ChangeEventHandler<HTMLInputElement> = ({
    currentTarget: { name, value },
  }) => setState((prev) => ({ ...prev, [name]: +value }));

  const handleCheckboxChange: ChangeEventHandler<HTMLInputElement> = ({
    currentTarget: { name, checked },
  }) => setState((prev) => ({ ...prev, [name]: checked }));

  return {
    handleStringInputChange,
    handleNumberInputChange,
    handleCheckboxChange,
  };
}

function calculateLength(length: number, parts: number) {
  const result = length / parts;
  return result;
}

function createHandlerFrameLength(
  setState: StateSetter,
  propertyName: keyof PatternDataMessage,
) {
  return ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(currentTarget.value);
    const clampedValue = clamp(value, MIN_FRAME_SIZE, MAX_FRAME_SIZE);

    setState((prev) => {
      return {
        ...prev,
        [propertyName]: clampedValue,
      };
    });
  };
}

type NumberKeys = KeysOfType<PatternDataMessage, number>;

function createHandlerDerivePropertiesFromLength(
  setState: StateSetter,
  lengthPropertyName: NumberKeys,
  countPropertyName: NumberKeys,
  paddingPropertyName: NumberKeys,
) {
  return ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    const value = toInteger(currentTarget.value);
    setState((prev) => {
      const prevCount = prev[countPropertyName];
      const prevPadding = prev[paddingPropertyName];

      const newCount = clamp(prevCount, 1, value);
      const newLength = calculateLength(value, newCount);
      const newPadding = clamp(prevPadding, 0, newLength - 1);

      return {
        ...prev,
        [lengthPropertyName]: value,
        [countPropertyName]: newCount,
        [paddingPropertyName]: newPadding,
      };
    });
  };
}

function createHandlerDeriveCountFromLength(
  setState: StateSetter,
  lengthPropertyName: NumberKeys,
  countPropertyName: NumberKeys,
  paddingPropertyName: NumberKeys,
) {
  return ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    const value = toInteger(currentTarget.value);

    setState((prev) => {
      const prevLength = prev[lengthPropertyName];
      const prevPadding = prev[paddingPropertyName];

      const lengthElementsCount = clamp(value, 1, prevLength);
      const elementWidth = calculateLength(prevLength, lengthElementsCount);
      const maxPadding = elementWidth - 1;

      return {
        ...prev,
        [countPropertyName]: lengthElementsCount,
        [paddingPropertyName]: clamp(prevPadding, 0, maxPadding),
      };
    });
  };
}

function createHandlerLengthPadding(
  setState: StateSetter,
  lengthPropertyName: NumberKeys,
  countPropertyName: NumberKeys,
  paddingPropertyName: NumberKeys,
) {
  return ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    const value = toInteger(currentTarget.value);

    setState((prev) => {
      const prevLength = prev[lengthPropertyName];
      const prevCount = prev[countPropertyName];

      const newElementLength = calculateLength(prevLength, prevCount);
      const maxPadding = newElementLength - 1;
      const newPadding = clamp(value, 0, maxPadding);

      return {
        ...prev,
        [paddingPropertyName]: newPadding,
      };
    });
  };
}

export function useManagedInputs(setState: StateSetter) {
  const handleFrameWidthChange = createHandlerFrameLength(
    setState,
    "frameWidth",
  );

  const handleFrameHeightChange = createHandlerFrameLength(
    setState,
    "frameHeight",
  );

  const handleFrameWidthBlur = createHandlerDerivePropertiesFromLength(
    setState,
    "frameWidth",
    "columns",
    "xPadding",
  );

  const handleFrameHeightBlur = createHandlerDerivePropertiesFromLength(
    setState,
    "frameHeight",
    "rows",
    "yPadding",
  );

  const handleHorizontalElementsCountChange =
    createHandlerDeriveCountFromLength(
      setState,
      "frameWidth",
      "columns",
      "xPadding",
    );

  const handleVerticalElementsCountChange = createHandlerDeriveCountFromLength(
    setState,
    "frameHeight",
    "rows",
    "yPadding",
  );

  const handleXPaddingChange = createHandlerLengthPadding(
    setState,
    "frameWidth",
    "columns",
    "xPadding",
  );

  const handleYPaddingChange = createHandlerLengthPadding(
    setState,
    "frameHeight",
    "rows",
    "yPadding",
  );

  return {
    handleFrameWidthChange,
    handleFrameHeightChange,
    handleFrameWidthBlur,
    handleFrameHeightBlur,
    handleHorizontalElementsCountChange,
    handleVerticalElementsCountChange,
    handleXPaddingChange,
    handleYPaddingChange,
  };
}
