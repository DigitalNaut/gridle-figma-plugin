import type { PatternDataMessage } from "@common";
import { MIN_FRAME_SIZE, MAX_FRAME_SIZE, toFloat } from "@common";

import { CollapsibleSubsection } from "~/components/Layout";
import Input from "~/components/Input";
import AxisIcon from "~/components/AxisIcon";
import PaddingIcon from "~/components/PaddingIcon";
import { useManagedInputs } from "~/hooks/useUserInputs";
import { usePatternDataContext } from "~/hooks/usePatternData";

export function FrameSection({
  isSectionOpen,
  handleSectionToggle,
}: {
  isSectionOpen: boolean;
  handleSectionToggle: () => void;
}) {
  const {
    patternData: patternMessage,
    setPatternData: setPatternMessage,
    elementWidth,
    elementHeight,
    derivedElementHeight,
    derivedElementWidth,
  } = usePatternDataContext();
  const {
    handleFrameWidthChange,
    handleFrameHeightChange,
    handleFrameWidthBlur,
    handleFrameHeightBlur,
    handleHorizontalElementsCountChange,
    handleVerticalElementsCountChange,
    handleXPaddingChange,
    handleYPaddingChange,
  } = useManagedInputs(setPatternMessage);

  return (
    <CollapsibleSubsection
      isOpen={isSectionOpen}
      id="frame"
      title="Frame"
      onToggle={handleSectionToggle}
    >
      <div className="flex w-full">
        <span className="grow text-sm">Frame size</span>
      </div>
      <div className="flex flex-1 justify-between gap-2">
        <Input<PatternDataMessage, number>
          label="W"
          labelStyle="flex-1"
          labelTextStyle="flex-1 w-6 text-center"
          id="frameWidthInput"
          name="frameWidth"
          type="number"
          min={MIN_FRAME_SIZE}
          max={MAX_FRAME_SIZE}
          maxLength={4}
          value={patternMessage.frameWidth}
          onChange={handleFrameWidthChange}
          onBlur={handleFrameWidthBlur}
          title="Width of the frame in pixels."
        />
        <Input<PatternDataMessage, number>
          label="H"
          labelStyle="flex-1"
          labelTextStyle="flex-1 w-6 text-center"
          id="frameHeightInput"
          name="frameHeight"
          type="number"
          min={MIN_FRAME_SIZE}
          max={MAX_FRAME_SIZE}
          maxLength={4}
          value={patternMessage.frameHeight}
          onChange={handleFrameHeightChange}
          onBlur={handleFrameHeightBlur}
          title="Height of the frame in pixels."
        />
      </div>
      <div className="flex flex-1 justify-between gap-2">
        <Input<PatternDataMessage, number>
          label={<AxisIcon className="rotate-90 transform" />}
          labelStyle="flex-1"
          id="rowsInput"
          name="rows"
          type="number"
          min={1}
          max={toFloat(patternMessage.frameWidth)}
          maxLength={4}
          value={patternMessage.columns}
          onChange={handleHorizontalElementsCountChange}
          title="Number of rows."
        />
        <Input<PatternDataMessage, number>
          label={<AxisIcon />}
          labelStyle="flex-1"
          id="columnsInput"
          name="columns"
          type="number"
          min={1}
          max={toFloat(patternMessage.frameHeight)}
          maxLength={4}
          value={patternMessage.rows}
          onChange={handleVerticalElementsCountChange}
          title="Number of columns."
        />
      </div>
      <div className="flex w-full">
        <span className="grow text-sm">Padding</span>
      </div>
      <div className="flex w-full gap-2">
        <Input<PatternDataMessage, number>
          label={<PaddingIcon className="rotate-90 transform" />}
          labelStyle="flex-1"
          id="xPaddingInput"
          name="xPadding"
          type="number"
          min={0}
          max={toFloat(elementWidth - 1)}
          maxLength={8}
          value={toFloat(patternMessage.xPadding)}
          onChange={handleXPaddingChange}
          title="Horizontal padding between elements."
        />
        <Input<PatternDataMessage, number>
          label={<PaddingIcon />}
          labelStyle="flex-1"
          id="yPaddingInput"
          name="yPadding"
          type="number"
          min={0}
          max={toFloat(elementHeight - 1)}
          maxLength={8}
          value={toFloat(patternMessage.yPadding)}
          onChange={handleYPaddingChange}
          title="Vertical padding between elements."
        />
      </div>
      <div className="flex w-full justify-between pt-2">
        <span>Element size:</span>
        <span className="flex items-center gap-1">
          <span className={derivedElementWidth < 0 ? "text-orange-500" : ""}>
            {derivedElementWidth}
          </span>
          x
          <span className={derivedElementHeight < 0 ? "text-orange-500" : ""}>
            {derivedElementHeight}
          </span>
          px
        </span>
      </div>
    </CollapsibleSubsection>
  );
}
