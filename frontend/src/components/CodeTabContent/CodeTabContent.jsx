// CodeTabContent.jsx - Refactored
import "./CodeTabContent.css";
import { useCodeTabLogic } from "../../hooks/useCodeTabLogic";
import { useCSSTabLogic } from "../../hooks/useCSSTabLogic";
import { useSettingsContext } from "../../contexts/settingsContext";
import { useCodeAnalytics } from "../../hooks/useCodeAnalytics";

// Components
import Accordion from "../Accordion/Accordion"
import CodeSection from "./CodeSection";

const CodeTabContent = ({ codeProcessor, cssProcessor = null, currentStatus = null, exId = null }) => {
  const {
    processedHTML,
    isLoading,
    getHTMLHintErrorsForLine,
    lineHasHTMLHintError,
    htmlHintErrors
  } = codeProcessor;

  const { settings } = useSettingsContext();
  
  // Analytics
  const { userId, logLineClickEvent, logCodeChangeEvent } = useCodeAnalytics(
    exId, 
    processedHTML, 
    htmlHintErrors
  );

  const htmlTabLogic = useCodeTabLogic(codeProcessor, currentStatus, exId);

  const cssTabLogic = useCSSTabLogic(cssProcessor || { processedCSS: [] }, currentStatus, exId);

  const hasHTML = processedHTML && processedHTML.length > 0;
  const hasCSS = cssProcessor?.processedCSS && cssProcessor.processedCSS.length >0

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <div>
      {hasHTML && (
        <Accordion title="HTML" defaultOpen>
          <CodeSection
            lines={processedHTML}
            lineHasError={lineHasHTMLHintError}
            getErrorsForLine={getHTMLHintErrorsForLine}
            tabLogic={htmlTabLogic}
            settings={settings}
          />
        </Accordion>
      )}


      {hasCSS && (
        <Accordion title="CSS">
          <CodeSection
            lines={cssProcessor.processedCSS}
            lineHasError={cssProcessor.lineHasCSSError}
            getErrorsForLine={cssProcessor.getCSSErrorsForLine}
            tabLogic={cssTabLogic}
            currentStatus={currentStatus}
            settings={settings}
          />
        </Accordion>
      )}

    </div>
  );
};

export default CodeTabContent;